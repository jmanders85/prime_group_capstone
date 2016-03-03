var express = require('express');
var passport = require('passport');




var bodyParser = require('body-parser');//add
var logger = require('morgan');//add
var uploads = require('./routes/uploads');//add







var OAuth2Strategy = require('passport-oauth2');

var index = require('./routes/index');
var internal = require('./routes/api_internal');

var app = express();

require('dotenv').config();

app.use(passport.initialize());

passport.use('oauth', new OAuth2Strategy(
  {
    authorizationURL: 'https://user.sportngin.com/oauth/authorize',
    tokenURL: 'https://api-user.ngin.com/oauth/token',
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/login/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    var user = {};
    user.accessToken = accessToken;
    done(null, user);
  }
));





app.use(logger('dev'));//add
app.use(bodyParser.urlencoded({extended: false}));//add







app.use(bodyParser.json());
app.use(express.static('server/public'));


app.use('/uploads', uploads);//add
app.use('/uploads', express.static('uploads'));//add


app.use('/internal', internal);
app.use('/', index);















var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log("Listening on port", port);
});
