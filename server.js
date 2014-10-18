var dotenv = require('dotenv').load()
var restify = require('restify');
var mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI)

var Landmark = require('./models/landmark.js')
var migration_landmarks = require('./migrations/migration-landmarks')

var server = restify.createServer();

server.get('/json', function(req, res, next) {
  res.send({json: 'test', yolo: 'swagger'})
  next()
})

server.get('/landmarks', function(req, res, next) {
  Landmark.find({}).exec(function (err, results) {
    if (err) return handleError(err);
    res.send(results)
    next()
  })
})

server.get('/landmarks/migrate', function(req, res, next) {
  Landmark.find({}).sort({rating:-1}).remove().exec();
  migration_landmarks.migrate()
  res.send({success:true})
  next()
})

server.get('/cluster', function(req, res, next) {
    res.send()
    next()
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});