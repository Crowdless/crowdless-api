var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var networkSchema = new Schema({
  landmark_id: String,
  network: String
});

var Network = mongoose.model('Network', networkSchema);

module.exports = Network