const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  buyin: {
    type: Number
  },
  buyinHistory: [{
    type: Number
  }],
  finalStack: {
    type: Number
  }

});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
