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
  const { playerList, currentPlayerList, pot, isPlaying, owner } = req.body;

  const newCashGame = CashGame({
    playerList,
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

module.exports = router;
