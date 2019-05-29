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
        logger.error("Caught ERROR! "+err);
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
            setTimeout(synccheck, 100, fids, 1);
        } else {
            process.exit(0);
        }
    }). catch (err => {
        logger.error(err);
        process.exit(1);
    })

}

walker.on("end", function () {

    const fids = Object.keys(fileIds);

    fids.map(fid => {
        logger.notice("git-file-scanner", "SCANNING " + fileIds[fid]);
    });

    validateapi.validate_all(fids).then (() => {
        poll_for_results(fids);
    }).catch(err => {
        logger.error("git-file-scanner", "Giving up... error calling validation service.", err);
        process.exit(1);
    });

});
