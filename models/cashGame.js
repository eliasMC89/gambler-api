const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Player = require('./player');

const cashGameSchema = new Schema({
  playerList: [Player.schema],
  currentPlayerList: [Player.schema],
  pot: {
    type: Number
  },
  isPlaying: {
    type: Boolean
  },
  owner: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'Start date',
    updatedAt: 'End date'
  }
});

const CashGame = mongoose.model('Cash', cashGameSchema);

module.exports = CashGame;
