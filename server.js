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

  // Do some fancy alex stuff here

  var sample = [
    {
      landmark: {
        name: "Big Ben",
        image_url: "http://images.rapgenius.com/du3efo4t81u169zb6516x29ev.1000x375x1.jpg",
        coords: [0,0]
      },
      timeframe: {
        start: 131231232,
        end: 3123123123
      }
    },
    {
      landmark: {
        name: "Big Ben",
        image_url: "http://images.rapgenius.com/du3efo4t81u169zb6516x29ev.1000x375x1.jpg",
        coords: [0,0]
      },
      timeframe: {
        start: 131231232,
        end: 3123123123
      }
    },
    {
      landmark: {
        name: "Big Ben",
        image_url: "http://images.rapgenius.com/du3efo4t81u169zb6516x29ev.1000x375x1.jpg",
        coords: [0,0]
      },
      timeframe: {
        start: 131231232,
        end: 3123123123
      }
    }
  ];
  res.send(sample)
  next()
})

server.get('/cluster', function(req, res, next) {
    res.send()
    next()
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});