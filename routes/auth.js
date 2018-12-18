const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

// const { isLoggedIn } = require('../helpers/middlewares');

router.get('/me', (req, res, next) => {
  if (req.session.currentUser) {
    res.json(req.session.currentUser);
  } else {
    res.status(404).json({
      error: 'not-found'
    });
  }
});

router.post('/login', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({
      error: 'unauthorized'
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(422).json({
      error: 'empty fields'
    });
  }

  User.findOne({
    username
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          error: 'user not exists'
        });
      }
      // TODO async bcrypt
      if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        return res.status(200).json(user);
      }
      return res.status(404).json({
        error: 'wrong password'
      });
    })
    .catch(next);
});

router.post('/signup', (req, res, next) => {
  const {
    username,
    password
  } = req.body;

  if (!username || !password) {
    return res.status(422).json({
      error: 'empty'
    });
  }

  User.findOne({
    username
  }, 'username')
    .then((userExists) => {
      if (userExists) {
        return res.status(422).json({
          error: 'username-not-unique'
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = User({
        username,
        password: hashPass,
        image: '',
        gamesPlayed: 0,
        totalWon: 0,
        totalLost: 0
      });

      return newUser.save().then(() => {
        req.session.currentUser = newUser;
        res.json(newUser);
      });
    })
    .catch(next);
});

router.post('/logout', (req, res) => {
  // console.log(req.session.currentUser);
  req.session.currentUser = null;
  return res.status(204).send();
});

router.get('/search/:username', (req, res, next) => {
  const username = req.params.username;

  User.findOne({ username }, 'username')
    .then((username) => {
      res.json(username);
    })
    .catch(next);
});

module.exports = router;
