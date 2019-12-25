const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user.username) {
    return res.status(422).send({
      errors: {
        message: 'username is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).send({
      errors: {
        message: 'password is required',
      },
    });
  }

  user.role = user.role || 'user';

  const finalUser = new Users(user);

  finalUser.setPassword(user.password);

  return finalUser.save()
    .then(() => res.json({ user: finalUser.toAuthJSON(true) }));
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { username, password } } = req;
  if(!username) {
    return res.status(422).send({
      errors: {
        message: 'username is required',
      },
    });
  }

  if(!password) {
    return res.status(422).send({
      errors: {
        message: 'password is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      return next(err);
    }
    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON(true) });
    }

    return res.status(400).send(info);
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/me', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }
      return res.json({ user: user.toAuthJSON(), ok: true });
    });
});

router.put('/favorites', auth.required, async (req, res, next) => {
  const { body: { favorite, command }, payload: { id }} = req;
  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }
      if (command === 'add') {
        user.favorites.push(favorite);
      } else if (command === 'remove') {
        user.favorites.splice(user.favorites.map((fav) => fav.id).indexOf(favorite), 1);
      }
      return user.save()
        .then(() =>res.json({ message: "Favorites Updated", ok: true, id, command }))
    });
});

router.get('/logout', (req, res) => {
    req.logout();
    return res.json({ message: "Logged Out", ok: true})
  });

module.exports = router;