var mongoose = require('mongoose')
var superagent = require('superagent')

var Landmark = require('../models/landmark.js')

exports.migrate = function() {
  superagent.get('https://api.foursquare.com/v2/venues/explore?client_id=ZSJ3HQEGJSPK3ETVYTKCLAKDSKCNK3J0QNX3HALZZ3F3RSKF&client_secret=4IDK2NTPKFNCDF2HOQMOSQ5CN43D3YKDT3CPBRBS3VHPII1V&v=20141018&near=London&section=sights&limit=50', function(res){
    var landmarks = res.body.response.groups[0].items;
    for ( var i = 0 ; i < landmarks.length ; i++ ) {
      var landmark = landmarks[i].venue
      console.log(landmark.name);
      new Landmark({name: landmark.name, description: "No description yet", img_src:"", rating: landmark.rating, coords: [landmark.location.lat, landmark.location.lng]}).save();
    };
  });
}