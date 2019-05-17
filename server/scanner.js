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

scanner.results = (fileIds, frequency) => {
    logger.notice("RESULTS");

    const check = require('../src/check');
    const fids = fileIds.split(' ');

    fids.map(fid => {
        logger.notice("git-file-scanner", "SCANNING " + fid + "");
    });

    check.config_frequency(frequency);

    return new Promise((resolve, reject) => {

        validateapi.validate(fids).then (() => {
            check.synccheck(fids, 1).then((result) => {
                resolve(result);
            }). catch (err => {
                if (err.status == "error") {
                    reject(err);
                } else {
                    resolve(err);
                }
            })
        }).catch(err => {
            logger.error("git-file-scanner", "Giving up... error calling validation service.", err);
            reject({status:"error",message:err});
        });
    });
}

module.exports = scanner;
