const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Player = require('./player');

const cashGameSchema = new Schema({
  playerList: [Player.schema],
  currentPlayerList: [Player.schema],
  pot: {
    type: Number
  },
  remainingPot: {
    type: Number
  },
  isPlaying: {
    type: Boolean
  },
  owner: String,
  secondaryOwners: [{
    type: String
  }],
  pendingOwners: [{
    type: String
  }],
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
});

const CashGame = mongoose.model('Cash', cashGameSchema);

module.exports = CashGame;
