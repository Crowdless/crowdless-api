var mongoose = require('mongoose')
var superagent = require('superagent')

var Landmark = require('../models/landmark.js')

exports.migrate = function() {
  superagent.get('https://api.foursquare.com/v2/venues/explore?client_id=' + process.env.FOURSQUARE_CLIENT + '&client_secret=' + process.env.FOURSQUARE_SECRET + '&v=20141018&near=London&section=sights&limit=50&venuePhotos=1', function(res){
    var landmarks = res.body.response.groups[0].items;
    for ( var i = 0 ; i < landmarks.length ; i++ ) {
      var landmark = landmarks[i].venue
      if(typeof(landmark.featuredPhotos)!='undefined' && landmark.featuredPhotos.count>=1){
        var imgurl = landmark.featuredPhotos.items[0].prefix + '500x500' + landmark.featuredPhotos.items[0].suffix
      } else {
        var imgurl = ''
      }
      new Landmark({foursquare_id: landmark.id, name: landmark.name, description: "No description yet", image_url: imgurl, rating: landmark.rating, coords: [landmark.location.lat, landmark.location.lng]}).save();
    };
  });
}