const logger = require('npmlog');
const nconf = require('nconf');

logger.level = 'notice';

nconf
.env({separator: "_", lowerCase: true, parseValues: true})
.file({ file: './config/default.json' })
.defaults({source: '.'});
