const logger = require('npmlog');
const nconf = require('nconf');

logger.level = 'notice';

nconf
.env({separator: "_", lowerCase: true, parseValues: true})
.file({ file: './config/default.json' })
.defaults({source: '.'});

const minio = require('./clients/minio');
const validateapi = require('./clients/validateapi');
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

    minio.upload(root + "/" + fileStats.name, fileStats.name).then((fid) => {
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

function check (fids, tries) {
    if (tries == 100) {
        logger.error("git-file-scanner", "Giving up... files were not validated so considering it a fail!");
        process.exit(1);
    }

    validateapi.status(fids).then(pass => {
        if (!pass) {
            logger.notice("git-file-scanner", "Waiting for scanning to complete (attempt " + tries + "). Sleeping 10 seconds..");
            setTimeout(check, 10000, fids, tries+1);
        } else {
            logger.notice("git-file-scanner", "Success!  All files passed scanning.");
            process.exit(0);
        }
    }).catch(status => {
        logger.error("git-file-scanner", "Giving up... some files failing validation");
        for (var i=0; i < fids.length; i++) {
            for (var j=0; j < status[fids[i]].length; j++) {

                if ((status[fids[i]][j].state === 1) && (status[fids[i]][j].mandatory === true)) {
                    logger.error("git-file-scanner", "%j : %j", fids[i], status[fids[i]][j].message);
                }
            }
        }
        process.exit(1);
    });
}

walker.on("end", function () {

    const fids = Object.keys(fileIds);

    fids.map(fid => {
        logger.notice("git-file-scanner", "SCANNING " + fileIds[fid] + "");
    });

    validateapi.validate(fids).then (() => {
        check(fids, 1);
    }).catch(err => {
        logger.error("git-file-scanner", "Giving up... error calling validation service.", err);
        process.exit(1);
    });

});
