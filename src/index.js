require('./init');
const logger = require('npmlog');
const nconf = require('nconf');
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

walker.on("end", function () {

    const check = require('./check');
    const fids = Object.keys(fileIds);

    fids.map(fid => {
        logger.notice("git-file-scanner", "SCANNING " + fileIds[fid] + "");
    });

    validateapi.validate(fids).then (() => {
        check.synccheck(fids, 1).then(() => {
            process.exit(0);
        }). catch (err => {
            process.exit(1);
        })
    }).catch(err => {
        logger.error("git-file-scanner", "Giving up... error calling validation service.", err);
        process.exit(1);
    });

});
