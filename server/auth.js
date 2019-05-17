const passport = require('passport');
const passApiKey = require('passport-headerapikey');
const HeaderAPIKeyStrategy = passApiKey.HeaderAPIKeyStrategy;
const config = require('nconf');
const logger = require('npmlog');

passport.use(new HeaderAPIKeyStrategy(
    { header: 'Authorization', prefix: 'Api-Key ' },
    false,
    function(apiKey, cb) {
        if (config.get("apikey") == apiKey) {
            const user = {
                "groups": []
            }
            return cb(null, user);
        } else {
            return cb(null, false);
        }
    }
));

module.exports = passport;