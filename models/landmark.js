var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var landmarkSchema = new Schema({
  foursquare_id: String,
  name: String,
  description: String,
  image_url: String,
  rating: Number,
  coords: {type: [Number], index: '2d'}
});

var Landmark = mongoose.model('Landmark', landmarkSchema);

module.exports = Landmark