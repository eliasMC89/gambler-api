const express = require('express');
const router = express.Router();

// const User = require('../models/user');
const CashGame = require('../models/cashGame');

router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  CashGame.findById(id)
    .then((game) => {
      res.status(200);
      res.json(game);
    })
    .catch(next);
});

router.post('/create', (req, res, next) => {
  const { playerList, pot, isPlaying, owner } = req.body;

  const newCashGame = CashGame({
    playerList,
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
