var dotenv = require('dotenv').load()
var restify = require('restify');
var mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI)

var migration = require('./migrations/migration-landmarks')
migration.migrate()

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
    next();
}

var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.get('/json', function(req, res, next) {
    res.send({json: 'test', yolo: 'swagger'})
    next()
})

server.get('/cluster', function(req, res, next) {
    res.send()
    next()
})

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});