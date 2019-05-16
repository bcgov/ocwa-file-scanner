require('../src/init');

const logger = require('npmlog');
const nconf = require('nconf');

const minio = require('../src/clients/minio');
const validateapi = require('../src/clients/validateapi');

var scanner = {}

scanner.upload = (fileName, fileData) => {
    logger.notice("UPLOAD");
    return minio.putObject(fileName, fileData);
}

scanner.results = (fileIds) => {
    logger.notice("RESULTS");

    const check = require('../src/check');
    const fids = fileIds.split(' ');

    fids.map(fid => {
        logger.notice("git-file-scanner", "SCANNING " + fid + "");
    });

    return new Promise((resolve, reject) => {

        validateapi.validate(fids).then (() => {
            check.synccheck(fids, 1).then(() => {
                resolve();
            }). catch (err => {
                logger.error("git-file-scanner", "Unexpected error", err);
                reject(err);
            })
        }).catch(err => {
            logger.error("git-file-scanner", "Giving up... error calling validation service.", err);
            reject(err);
        });
    });
}

module.exports = scanner;
