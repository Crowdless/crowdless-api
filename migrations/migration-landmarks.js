var mongoose = require('mongoose')
var superagent = require('superagent')

var Landmark = require('../models/landmark.js')

exports.migrate = function() {
  superagent.get('https://api.foursquare.com/v2/venues/explore?client_id=' + process.env.FOURSQUARE_CLIENT + '&client_secret=' + process.env.FOURSQUARE_SECRET + '&v=20141018&near=London&section=sights&limit=50&venuePhotos=1', function(res){
    var landmarks = res.body.response.groups[0].items;
    for ( var i = 0 ; i < landmarks.length ; i++ ) {
      var landmark = landmarks[i]
      var venue = landmark.venue

      if(typeof(venue.featuredPhotos)!='undefined' && venue.featuredPhotos.count>=1){
        var imgurl = venue.featuredPhotos.items[0].prefix + '500x500' + venue.featuredPhotos.items[0].suffix
      } else {
        var imgurl = 'http://placehold.it/500x500'
      }

      var description = landmark.tips[0].text;

      new Landmark({foursquare_id: venue.id, name: venue.name, description: description, people: venue.hereNow.count, image_url: imgurl, rating: venue.rating, coords: [venue.location.lat, venue.location.lng]}).save();
    };
  });
}