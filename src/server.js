const express = require('express');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

const {Header, Footer} = require(`./views`);

passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: `http://${process.env.HOST}:${process.env.PORT}/login/twitter/return`
  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const app = express();

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  res.send(`${Header}${
    req.user ?
      `<p>Hello, ${req.user.username}. View your <a href="/profile">profile</a>.</p>` :
      `<p>Welcome! Please <a href="/login">Log in</a>.</p>`
  }${Footer}`
  );
});

app.get('/login', function(req, res) {
  res.send(`${Header}<a href="/login/twitter">Log In with Twitter</a>${Footer}`);
});

app.get('/login/twitter', passport.authenticate('twitter'));

app.get('/login/twitter/return', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
  res.redirect('/');
});

app.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  const {user} = req;
  res.send(`${Header}
        <p>ID: ${user.id}</p>
        <p>Username: ${user.username}</p>
        <p>Name: ${user.displayName}</p>
        ${
          (user.emails) ?
            `<p>Email: ${user.emails[0].value}</p>` :
            ``
        }
${Footer}`
  );
});

app.listen(process.env.PORT, function() {
  console.log(`Server is listening on port ${process.env.PORT}`)
});