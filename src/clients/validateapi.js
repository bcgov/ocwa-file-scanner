const logger = require('npmlog');
const config = require('nconf');
const httpReq = require('request');
const util = require('./util');

let validateapi = {}

validateapi.validate = (files) => {
    return new Promise((resolve, reject) => {
        for (var i=0; i<files.length; i++) {
            var myFile = files[i];
            httpReq.put({
                url: config.get('validationapi') + '/v1/validate/' + myFile,
                headers: {
                    'x-api-key': config.get('validationapisecret')
                }
            }, function (apiErr, apiRes, body) {
                logger.verbose("put file " + myFile + " up for validation");
                if (apiErr) {
                    logger.error("Error validating file: ", apiErr);
                    return reject(apiErr);
                } else {
                    resolve(files);
                }
            });
        }
    });
}

validateapi.status = (files) => {
    return new Promise((resolve, reject) => {

        util.getFileStatus(files, function(status) {
            logger.verbose("Got all file statuses");

            if (Object.keys(status).length !== files.length){
                logger.error("Not all files were submitted for validation, did you let save finish?");
                return reject();
            }

            var count = 0;
            var pass = true;
            var blocked = false;
            var pending = false;
            for (var i=0; i < files.length; i++) {
                for (var j=0; j < status[files[i]].length; j++) {

                    if ((status[files[i]][j].state === 1) && (status[files[i]][j].mandatory === true)) {
                        blocked = true;
                    }

                    if (status[files[i]][j].state === 2){
                        pending = true;
                        count++;
                    }

                    if ((status[files[i]][j].pass === false) && (status[files[i]][j].mandatory === true)) {
                        pass = false;
                    }
                }
            }
            logger.notice('validateapi', "Passed=%j, Blocked=%j, Pending=%j, Queued=%j", pass, blocked, pending, count);
            if (pending == 0 && blocked) {
                return reject(status);
            }
            resolve(pass);
        });
    });
};

module.exports = validateapi;
