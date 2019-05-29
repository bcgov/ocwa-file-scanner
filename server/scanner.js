require('../src/init');

const logger = require('npmlog');
const nconf = require('nconf');

const minio = require('../src/clients/minio');
const validateapi = require('../src/clients/validateapi');

var scanner = {}

scanner.upload = (fileName, fileData) => {
    logger.notice("UPLOAD");
    return minio.putObject(fileName, fileData).then (fid => {
        return validateapi.validate(fid);
    });
}

scanner.results = (fileIds, frequency) => {
    logger.verbose("RESULTS FOR ", fileIds);

    const check = require('../src/check');
    const fids = fileIds.split(' ');

    fids.map(fid => {
        logger.notice("git-file-scanner", "SCANNING " + fid + "");
    });

    check.config_frequency(frequency);

    return new Promise((resolve, reject) => {

        check.synccheck(fids, 1).then((result) => {
            logger.verbose("Returning " + JSON.stringify(result));
            resolve(result);
        }). catch (err => {
            if (err.status == "error") {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
}

module.exports = scanner;
