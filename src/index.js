require('./init');
const logger = require('npmlog');
const nconf = require('nconf');
const minio = require('./clients/minio');
const validateapi = require('./clients/validateapi');
const uuidv1 = require('uuid/v1');
const walk = require('walk');
const fs = require('fs');
let walker;

const folder = nconf.get("source");

let envvars = ["CI_DEFAULT_BRANCH", "CI_MERGE_REQUEST_SOURCE_BRANCH_NAME", "CI_MERGE_REQUEST_TARGET_BRANCH_NAME"]

envvars.forEach((e) => {
    logger.notice("ENV ", e, " = ", process.env[e]);
});

const policy = 'export-code';

if ('CI_MERGE_REQUEST_TARGET_BRANCH_NAME' in process.env && process.env['CI_MERGE_REQUEST_SOURCE_BRANCH_NAME'].endsWith('-incoming')) {
    policy = 'import-code'
    logger.notice("Policy DETECTED to be: ", policy);
} else {
    logger.notice("Policy DEFAULTED to be: ", policy);
}

walker = walk.walk(folder, {});

let fileIds = {}

walker.on("file", function (root, fileStats, next) {
    logger.verbose(root + "/" + fileStats.name);
    if (root.indexOf('/.git') >= 0) {
        logger.verbose("-- Skipping - " + root + "/" + fileStats.name);
        return next();
    }

    minio.upload(root + "/" + fileStats.name, uuidv1() + "/" + fileStats.name).then((fid) => {
        fileIds[fid] = root + "/" + fileStats.name;
        next();
    }).catch (err => {
        logger.error("file-scanner", "Caught ERROR trying to upload to Minio!", err);
        process.exit(1);
    });
});

walker.on("errors", function (root, nodeStatsArray, next) {
    process.exit(1);
});

function poll_for_results (fids) {

    const check = require('./check');

    check.synccheck(fids, 1).then((result) => {
        logger.notice("Result: "+JSON.stringify(result));

        if (result.status == "waiting") {
            setTimeout(poll_for_results, 100, fids, 1);
        } else {
            process.exit(0);
        }
    }). catch (err => {
        logger.error(err);
        process.exit(1);
    })

}

walker.on("end", function () {

    logger.error("git-file-scanner", "What is the policy??");

    const fids = Object.keys(fileIds);

    fids.map(fid => {
        logger.notice("git-file-scanner", "SCANNING ", fileIds[fid]);
    });

    validateapi.validate_all(fids, policy).then (() => {
        poll_for_results(fids);
    }).catch(err => {
        logger.error("git-file-scanner", "Giving up... error calling validation service.", err);
        process.exit(1);
    });

});
