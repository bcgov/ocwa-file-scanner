const logger = require('npmlog');
const validateapi = require('./clients/validateapi');

var check = {}

check.frequency = 10000;

check.config_frequency = (frequency) => {
    check.frequency = frequency;
}

check.synccheck = (fids, tries) => {
    return new Promise((resolve, reject) => {
        check.check (fids, tries, resolve, reject);
    });
}

check.check = (fids, tries, resolve, reject) => {
    if (tries == 100) {
        logger.error("git-file-scanner", "Giving up... files were not validated so considering it a fail!");
        reject({status:'error', message:'timed out waiting for validation'});
    }

    validateapi.status(fids).then(pass => {
        if (!pass) {
            logger.notice("git-file-scanner", "Waiting for scanning to complete (attempt " + tries + "). Sleeping " + (check.frequency/1000) + " seconds..");
            setTimeout(check.check, check.frequency, fids, tries+1, resolve, reject);
        } else {
            logger.notice("git-file-scanner", "Success!  All files passed scanning.");
            resolve({status:'pass'});
        }
    }).catch(status => {
        logger.error("git-file-scanner", "Giving up... some files failing validation", status);
        let summary = {}
        if (status) {
            for (var i=0; i < fids.length; i++) {
                for (var j=0; j < status[fids[i]].length; j++) {

                    if ((status[fids[i]][j].state === 1) && (status[fids[i]][j].mandatory === true)) {
                        logger.error("git-file-scanner", "%j : %j", fids[i], status[fids[i]][j].message);
                        if (fids[i] in summary) {
                            summary[fids[i]].push(status[fids[i]][j])
                        } else {
                            summary[fids[i]] = [ status[fids[i]][j] ]
                        }
                    }
                }
            }
            reject({status:'fail', results:summary});
        } else {
            reject({status:'error', message:'Unexpected error validating files'});
        }
    });
}

module.exports = check;
