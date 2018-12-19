const express = require('express');
const router = express.Router();

const CashGame = require('../models/cashGame');

// Get list of my games
router.get('/my-games', (req, res, next) => {
  const userId = req.session.currentUser._id;

  CashGame.find({ $or: [{ owner: userId }, { secondaryOwners: userId }] })
    .then((games) => {
      res.json(games);
    })
    .catch(next);
});

// Get list of pending shared games
router.get('/my-shared-games', (req, res, next) => {
  const userId = req.session.currentUser._id;

  CashGame.find({ pendingOwners: userId })
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
  const { currentPlayerList, pot, remainingPot, owner, isPlaying } = req.body;
  const startDate = new Date();

  const newCashGame = CashGame({
    playerList: [],
    currentPlayerList,
    pot,
    remainingPot,
    owner,
    isPlaying,
    startDate
  });

  return newCashGame.save()
    .then((game) => {
      res.json({
        game: newCashGame
      });
    })
    .catch(next);
});

// Delete game
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  CashGame.findByIdAndRemove(id)
    .then((game) => {
      res.status(200);
      res.json(game);
    })
    .catch(next);
});

// Delete shared game
router.put('/:id/delete-shared', (req, res, next) => {
  const { id } = req.params;
  const userId = req.session.currentUser._id;

  CashGame.findByIdAndUpdate(id, { $pull: { secondaryOwners: userId } })
    .then((game) => {
      res.json(game);
    })
    .catch(next);
});

// Add to secondary owner after invitation accept
router.put('/:id/new-owner', (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  CashGame.findByIdAndUpdate(id, { $push: { secondaryOwners: userId }, $pull: { pendingOwners: userId } })
    .then((game) => {
      res.json(game);
    })
    .catch(next);
});

// Delete from pending after invitation reject
router.put('/:id/reject-share', (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  CashGame.findByIdAndUpdate(id, { $pull: { pendingOwners: userId } })
    .then((game) => {
      res.json(game);
    })
    .catch(next);
});

// Add player while playing
router.put('/:id/new-player', (req, res, next) => {
  const { id } = req.params;
  const { newRebuy, currentPlayerList } = req.body;

  CashGame.findByIdAndUpdate(id, { $set: { 'currentPlayerList': currentPlayerList }, $inc: { 'pot': newRebuy, 'remainingPot': newRebuy } })
    .then((game) => {
      res.json(game);
    })
    .catch(next);
});

// End game and update end date
router.put('/:id/end-game', (req, res, next) => {
  const { id } = req.params;
  const endDate = new Date();

  CashGame.findByIdAndUpdate(id, { $set: { endDate, isPlaying: false } })
    .then((game) => {
      res.json(game);
    })
    .catch(next);
});

// Add final stack to player
router.put('/:id/player-stack/:playerId', (req, res, next) => {
  const { id, playerId } = req.params;
  const { finalStack } = req.body;

  CashGame.findOneAndUpdate({ 'currentPlayerList._id': playerId }, { $set: { 'currentPlayerList.$.finalStack': finalStack, 'currentPlayerList.$.isPlaying': false } })
    .then(() => {
      CashGame.findByIdAndUpdate(id, { $inc: { remainingPot: -finalStack } })
        .then((game) => {
          res.json(game);
        })
        .catch(next);
    })
    .catch(next);
});

// Add rebuy
router.put('/:id/player-rebuy/:playerId', (req, res, next) => {
  const { id, playerId } = req.params;
  const { rebuy } = req.body;

  CashGame.findOneAndUpdate({ 'currentPlayerList._id': playerId }, { $inc: { 'currentPlayerList.$.buyin': rebuy }, $push: { 'currentPlayerList.$.buyinHistory': rebuy } })
    .then(() => {
      CashGame.findByIdAndUpdate(id, { $inc: { pot: rebuy, remainingPot: rebuy } })
        .then((game) => {
          res.json(game);
        })
        .catch(next);
    });
});

// Share with user (add to pending owner)
router.put('/:gameId/share/:shareUserId', (req, res, next) => {
  const { gameId, shareUserId } = req.params;

  CashGame.findByIdAndUpdate(gameId, { $push: { pendingOwners: shareUserId } })
    .then((game) => {
      res.json(game);
    })
    .catch(next);
});

module.exports = router;
