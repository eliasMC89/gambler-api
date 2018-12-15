const express = require('express');
const router = express.Router();

const CashGame = require('../models/cashGame');

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

  const newCashGame = CashGame({
    playerList: [],
    currentPlayerList,
    pot,
    isPlaying,
    owner
  });

  return newCashGame.save()
    .then((game) => {
      res.json({
        game: newCashGame
      });
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

// test edit
// router.put('/:id/testUpdate', (req, res, next) => {
//   const { id } = req.params;
//   // const { finalStack } = req.body;

//   CashGame.findByIdAndUpdate(id, { $set: { pot: '1000' } })
//     .then((game) => {
//       res.json(game);
//     });
// });

module.exports = router;
