const express = require('express');
const router = express.Router();

const CashGame = require('../models/cashGame');

// Get list of my games
router.get('/my-games', (req, res, next) => {
  const userId = req.session.currentUser._id;

  CashGame.find({ owner: userId })
    .then((games) => {
      res.json(games);
    })
    .catch(next);
});

// get game detail
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  CashGame.findById(id)
    .then((game) => {
      res.status(200);
      res.json(game);
    })
    .catch(next);
});

// create new game
router.post('/create', (req, res, next) => {
  const { currentPlayerList, pot, isPlaying, owner } = req.body;
  const startDate = new Date();

  const newCashGame = CashGame({
    playerList: [],
    currentPlayerList,
    pot,
    isPlaying,
    owner,
    startDate
  });

  return newCashGame.save()
    .then((game) => {
      res.json({
        game: newCashGame
      });
    });
});

// End game and update end date
router.put('/:id/end-game', (req, res, next) => {
  const { id } = req.params;
  const endDate = new Date();

  CashGame.findByIdAndUpdate(id, { $set: { endDate } })
    .then((game) => {
      res.json(game);
    });
});

// Add final stack to player
router.put('/player-stack/:playerId', (req, res, next) => {
  const { playerId } = req.params;
  const { finalStack } = req.body;
  // const finalStack = 999;

  CashGame.findOneAndUpdate({ 'currentPlayerList._id': playerId }, { $set: { 'currentPlayerList.$.finalStack': finalStack } })
    .then((game) => {
      res.json(game);
    });
});

// Add rebuy
router.put('/:id/player-rebuy/:playerId', (req, res, next) => {
  const { id, playerId } = req.params;
  const { rebuy } = req.body;

  CashGame.findOneAndUpdate({ 'currentPlayerList._id': playerId }, { $inc: { 'currentPlayerList.$.buyin': rebuy } })
    .then((game) => {
      CashGame.findByIdAndUpdate(id, { $inc: { pot: rebuy } })
        .then((game) => {
          res.json(game);
        });
    });
});

module.exports = router;
