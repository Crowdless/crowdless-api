var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var activitySchema = new Schema({
  interaction: {
    interaction: {
      geo: {
        latitude: Number,
        longitude: Number
      },
      created_at: String
    }
  }
});

var Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity