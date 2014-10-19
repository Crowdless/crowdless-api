var dotenv = require('dotenv').load()
var restify = require('restify');
var mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI)

var Landmark = require('./models/landmark.js')
var Activity = require('./models/activity.js')

var migration_landmarks = require('./migrations/migration-landmarks')

var server = restify.createServer();

server.use(restify.queryParser({mapParams:true}));

server.get('/json', function(req, res, next) {
  res.send({json: 'test', yolo: 'swagger'})
  next()
})

server.get('/landmarks', function(req, res, next) {
  Landmark.find({}).sort({rating:-1}).exec(function (err, results) {
    if (err) return handleError(err);
    res.send(results)
    next()
  })
})

server.get('/landmarks/migrate', function(req, res, next) {
  Landmark.find({}).remove().exec();
  migration_landmarks.migrate()
  res.send({success:true})
  next()
})

server.get('/schedule', function(req, res, next) {
  var ids = req.params.ids.split(',')

  var returnarray = []

  Landmark.find({_id:{$in:ids}}).exec(function (err, results) {
    if (err) return handleError(err)
    
    for(var i=0;i<results.length;i++){
      returnarray.push({landmark:results[i],timeframe:{start:12343,end:12344}})
    }

    res.send(returnarray)
    next()
  })
})

server.get('/cluster', function(req, res, next) {
    res.send()
    next()
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});