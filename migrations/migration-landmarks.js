var mongoose = require('mongoose')
var superagent = require('superagent')

var Landmark = require('../models/landmark.js')

exports.migrate = function() {
  superagent.get('https://api.foursquare.com/v2/venues/explore?client_id=' + process.env.FOURSQUARE_CLIENT + '&client_secret=' + process.env.FOURSQUARE_SECRET + '&v=20141018&near=London&section=sights&limit=50', function(res){
    var landmarks = res.body.response.groups[0].items;
    for ( var i = 0 ; i < landmarks.length ; i++ ) {
      var landmark = landmarks[i].venue
      new Landmark({name: landmark.name, description: "No description yet", img_src:"", rating: landmark.rating, coords: [landmark.location.lat, landmark.location.lng]}).save();
    };
  });
}