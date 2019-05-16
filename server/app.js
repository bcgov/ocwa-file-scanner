const logger = require('npmlog');
const scanner = require('./scanner')
const express = require('express')
const app = express()
const port = 3000

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/api/v1/upload', (req, res) => {
    logger.notice(JSON.stringify(req.body));
    scanner.upload (req.body.filename, req.body.file).then (fid => {
        res.send({id: fid});
    }).catch (err => {
        res.status(500);
        res.send(err);
    });
});

app.post('/api/v1/results', (req, res) => {
    logger.notice(JSON.stringify(req.body));

    scanner.results (req.body.filenames).then (() => {
        res.send("pass");
    }).catch (err => {
        res.status(500);
        res.send(err);
    });
});


app.listen(port, () => console.log(`Listening on port ${port}!`))

