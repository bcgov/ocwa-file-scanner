const logger = require('npmlog');
const validateapi = require('./clients/validateapi');

var check = {}

check.synccheck = (fids, tries) => {
    return new Promise((resolve, reject) => {
        check.check (fids, tries, resolve, reject);
    });
}

check.check = (fids, tries, resolve, reject) => {
    if (tries == 100) {
        logger.error("git-file-scanner", "Giving up... files were not validated so considering it a fail!");
        reject();
    }

    validateapi.status(fids).then(pass => {
        if (!pass) {
            logger.notice("git-file-scanner", "Waiting for scanning to complete (attempt " + tries + "). Sleeping 10 seconds..");
            setTimeout(check, 10000, fids, tries+1, resolve, reject);
        } else {
            logger.notice("git-file-scanner", "Success!  All files passed scanning.");
            resolve();
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
        reject();
    });
}

module.exports = check;
