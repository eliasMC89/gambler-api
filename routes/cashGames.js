const express = require('express');
const router = express.Router();

const CashGame = require('../models/cashGame');
const { isLoggedIn } = require('../helpers/middlewares');

// Get list of my games
router.get('/my-games', isLoggedIn(), (req, res, next) => {
  const userId = req.session.currentUser._id;

  CashGame.find({ $or: [{ owner: userId }, { secondaryOwners: userId }] })
    .then((games) => {
      res.json(games);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Get list of pending shared games
router.get('/my-shared-games', isLoggedIn(), (req, res, next) => {
  const userId = req.session.currentUser._id;

  CashGame.find({ pendingOwners: userId })
    .then((games) => {
      res.json(games);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// get game detail
router.get('/:id', isLoggedIn(), (req, res, next) => {
  const { id } = req.params;

  // control authorization
  CashGame.findById(id)
    .then((game) => {
      if (game.owner === req.session.currentUser._id || game.secondaryOwners.includes(req.session.currentUser._id)) {
        CashGame.findById(id)
          .then((game) => {
            res.status(200);
            res.json(game);
          })
          .catch(next);
      } else {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// create new game
router.post('/create', isLoggedIn(), (req, res, next) => {
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
    .catch(error => {
      res.status(500).json(error);
    });
});

// Delete game
router.delete('/:id', isLoggedIn(), (req, res, next) => {
  const { id } = req.params;

  // control authorization
  CashGame.findById(id)
    .then((game) => {
      if (game.owner === req.session.currentUser._id) {
        CashGame.findByIdAndRemove(id)
          .then((game) => {
            res.status(200);
            res.json(game);
          })
          .catch(error => {
            res.status(500).json({ err: error, msg: 'Cannot delete game' });
          });
      } else {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Delete shared game
router.put('/:id/delete-shared', isLoggedIn(), (req, res, next) => {
  const { id } = req.params;
  const userId = req.session.currentUser._id;

  CashGame.findByIdAndUpdate(id, { $pull: { secondaryOwners: userId } })
    .then((game) => {
      res.json(game);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Add to secondary owner after invitation accept
router.put('/:id/new-owner', isLoggedIn(), (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  CashGame.findByIdAndUpdate(id, { $push: { secondaryOwners: userId }, $pull: { pendingOwners: userId } })
    .then((game) => {
      res.json(game);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Delete from pending after invitation reject
router.put('/:id/reject-share', isLoggedIn(), (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  CashGame.findByIdAndUpdate(id, { $pull: { pendingOwners: userId } })
    .then((game) => {
      res.json(game);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Add player while playing
router.put('/:id/new-player', isLoggedIn(), (req, res, next) => {
  const { id } = req.params;
  const { newRebuy, currentPlayerList } = req.body;

  // control authorization
  CashGame.findById(id)
    .then((game) => {
      if (game.owner === req.session.currentUser._id) {
        CashGame.findByIdAndUpdate(id, { $set: { 'currentPlayerList': currentPlayerList }, $inc: { 'pot': newRebuy, 'remainingPot': newRebuy } })
          .then((game) => {
            res.json(game);
          })
          .catch(next);
      } else {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// End game and update end date
router.put('/:id/end-game', isLoggedIn(), (req, res, next) => {
  const { id } = req.params;
  const endDate = new Date();

  // control authorization
  CashGame.findById(id)
    .then((game) => {
      if (game.owner === req.session.currentUser._id) {
        CashGame.findByIdAndUpdate(id, { $set: { endDate, isPlaying: false } })
          .then((game) => {
            res.json(game);
          })
          .catch(next);
      } else {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Add final stack to player
router.put('/:id/player-stack/:playerId', isLoggedIn(), (req, res, next) => {
  const { id, playerId } = req.params;
  const { finalStack } = req.body;

  // control authorization
  CashGame.findById(id)
    .then((game) => {
      if (game.owner === req.session.currentUser._id) {
        CashGame.findOneAndUpdate({ 'currentPlayerList._id': playerId }, { $set: { 'currentPlayerList.$.finalStack': finalStack, 'currentPlayerList.$.isPlaying': false } })
          .then(() => {
            CashGame.findByIdAndUpdate(id, { $inc: { remainingPot: -finalStack } })
              .then((game) => {
                res.json(game);
              })
              .catch(next);
          })
          .catch(error => {
            res.status(400).json(error);
          });
      } else {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Add rebuy
router.put('/:id/player-rebuy/:playerId', isLoggedIn(), (req, res, next) => {
  const { id, playerId } = req.params;
  const { rebuy } = req.body;

  // control authorization
  CashGame.findById(id)
    .then((game) => {
      if (game.owner === req.session.currentUser._id) {
        CashGame.findOneAndUpdate({ 'currentPlayerList._id': playerId }, { $inc: { 'currentPlayerList.$.buyin': rebuy }, $push: { 'currentPlayerList.$.buyinHistory': rebuy } })
          .then(() => {
            CashGame.findByIdAndUpdate(id, { $inc: { pot: rebuy, remainingPot: rebuy } })
              .then((game) => {
                res.json(game);
              })
              .catch(next);
          })
          .catch(error => {
            res.status(500).json(error);
          });
      } else {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Share with user (add to pending owner)
router.put('/:id/share/:shareUserId', isLoggedIn(), (req, res, next) => {
  const { id, shareUserId } = req.params;

  // control authorization
  CashGame.findById(id)
    .then((game) => {
      if (game.owner === req.session.currentUser._id || game.secondaryOwners.includes(req.session.currentUser._id)) {
        CashGame.findByIdAndUpdate(id, { $push: { pendingOwners: shareUserId } })
          .then((game) => {
            res.json(game);
          })
          .catch(next);
      } else {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

module.exports = router;
