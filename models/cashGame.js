const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const cashGameSchema = new Schema({
  playerList: [{
    type: ObjectId,
    ref: 'Player'
  }],
  pot: {
    type: Number
  },
  playing: {
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
