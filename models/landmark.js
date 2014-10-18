var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var landmarkSchema = new Schema({
  name: String,
  description: String,
  img_url: String,
  rating: Number,
  coords: {type: [Number], index: '2d'}
});

var Landmark = mongoose.model('Landmark', landmarkSchema);