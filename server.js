var dotenv = require('dotenv').load()
var restify = require('restify');
var mongoose = require('mongoose')
var moment = require('moment')
var geolib = require('geolib')
var brain = require('brain')
var schedule = require('schedulejs')
var later = require('later')
var async = require('async')

mongoose.connect(process.env.MONGO_URI)

var Landmark = require('./models/landmark')
var Activity = require('./models/activity')
var Network = require('./models/network')

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

  var resultArray = []
  var landmark_networks = {}

  Network.find({}).exec(function (err, records_networks) {
    for (var i = 0; i < records_networks.length; i++) {
      landmark_networks[records_networks[i].landmark_id] = JSON.parse(records_networks[i].network)
    }

    Landmark.find({_id:{$in:ids}}).exec(function (err, records_landmarks) {
      for(var landmark_n in records_landmarks){
        var landmark = records_landmarks[landmark_n]
        
        var net = new brain.NeuralNetwork();
        net.fromJSON(landmark_networks[landmark._id]);
        var openingHours_busyness = [0,0,0,0,0,0,0,0,0,0]
        var counter_1 = 0
        for (var i = 9; i < 20; i++) {
          openingHours_busyness[counter_1] = net.run({h:i/24}).busy
          counter_1 ++
        };
        
        var lowest_index = 0
        var lowest_num = 1
        for (var i = 0; i < openingHours_busyness.length; i++) {
          var counter = openingHours_busyness[i]
          if(counter<lowest_num){
            lowest_index = i
            lowest_num = counter
          }
        };

        var op_time = lowest_index + 9;
        resultArray.push({key: landmark, value: op_time})
        console.log("Go to " + landmark.name + " @ " + op_time)
      }

      // Work out the schedule.
      // Calendar is a map where each hour of the day between 9am and 7pm is represented in 24 hour form.
      // If the preferred hour cannot be assigned the next hour is
      var calendar = {}
      for ( var iterator in records_landmarks) {
        var landmarkToVisit = records_landmarks[iterator]
        var time = resultArray[iterator].value

        var pushTime = function(timeArg) {
          timeArg = timeArg + 1
          if ( calendar[timeArg] == null ) {
            calendar[timeArg] = landmarkToVisit
          } else {
            pushTime(timeArg)
          }
        }

        if ( calendar[time] == null ) {
          calendar[time] = landmarkToVisit
        } else {
          pushTime(time)
        }

      }

      console.log(calendar)
      // Now we compile the final response object. The gateway to glory
      var response = []

      var keys = Object.keys(calendar)


      for (var key in keys) {
        var time = keys[key]
        var momentTime = moment()
        momentTime.
        var location = calendar[time]
        response.push({landmark: location, timeframe: {start: finalSchedule.scheduledTasks[location].earlyStart, end: finalSchedule.scheduledTasks[location].earlyFinish}})
      }

      res.send(response)
      next()
    })
  })

  // Landmark.find({_id:{$in:ids}}).exec(function (err, results) {
  //   if (err) return handleError(err)
    
  //   for(var i=0;i<results.length;i++){
  //     returnarray.push({landmark:results[i],timeframe:{start:12343,end:12344}})
  //   }

  //   res.send(returnarray)
  //   next()
  // })
})

server.get('/generate', function(req, res, next) {
  Network.find({}).remove().exec();

  Landmark.find({}).exec(function (err, records_landmarks) {
    Activity.find({}).limit(2000).exec(function (err, records_activities){
      for(var landmark_n in records_landmarks){
        var landmark = records_landmarks[landmark_n]
        var landmark_counters = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        for(var activity_n in records_activities){
          var activity = records_activities[activity_n]
          var distance = geolib.getDistance(
            { latitude: landmark.coords[0], longitude: landmark.coords[1] },
            { latitude: activity.interaction.interaction.geo.latitude, longitude: activity.interaction.interaction.geo.longitude }
          )
          if(distance<=process.env.DISTANCE_TOLERANCE){
            var time = moment(activity.interaction.interaction.created_at)
            var hour = time.hour()
            landmark_counters[hour]++;
          }
        }
        var highest_index = 0
        var highest_num = 0
        for (var i = 0; i < landmark_counters.length; i++) {
          var counter = landmark_counters[i]
          if(counter>highest_num){
            highest_index = i
            highest_num = counter
          }
        };
        var relative_count = []
        for (var i = 0; i < landmark_counters.length; i++) {
          relative_count[i] = landmark_counters[i]/highest_num
        };
        var net = new brain.NeuralNetwork()
        var stupid = []
        for (var i = 0; i < 24; i++) {
          stupid.push({input: {h:i/24}, output: {busy:relative_count[i]}});
        };
        net.train(stupid)

        var json = JSON.stringify(net.toJSON());
        new Network({landmark_id:landmark._id,network:json}).save()
      }
      res.send({done:true})
      next()
    })
  })
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});