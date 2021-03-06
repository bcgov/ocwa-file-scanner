const config = require('nconf');
const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: config.get('storage:endpoint'),
  port: config.get('storage:port'),
  useSSL: config.get('storage:usessl'),
  accessKey: config.get('storage:accesskey'),
  secretKey: config.get('storage:secretkey'),
});

let miniocli = {}

String.prototype.rreplaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

miniocli.upload = (path, fname) => {

    return new Promise((resolve, reject) => {
        var cleanName = fname.rreplaceAll('\/|\\.', '-');

        var metaData = {
            'Content-Type': 'application/octet-stream',
            'full-path': fname,
            'Filename' : fname
        }

        minioClient.fPutObject(config.get('storage:bucket'), cleanName, path, metaData, function(err, etag) {
            if (err) {
                return reject(err);
            }
            resolve(cleanName);
        });
    });
}

miniocli.putObject = (filename, data) => {

    return new Promise((resolve, reject) => {
        var cleanName = filename.rreplaceAll('\/|\\.', '-');

        var metaData = {
            'Content-Type': 'application/octet-stream',
            'full-path': filename,
            'Filename' : filename
        }

        minioClient.putObject(config.get('storage:bucket'), cleanName, data, null, metaData, function(err, etag) {
            if (err) {
                return reject(err);
            }
            resolve(cleanName);
        });
    });
}

module.exports = miniocli;
