var express = require('express');
var path = require('path');
var passport = require('passport');
var needle = require('needle');

var router = express.Router();

require('dotenv').config();

var accessToken = process.env.ACCESS_TOKEN;

router.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.get('/login',
  passport.authenticate('oauth', {session: false})
);

router.get('/login/callback',
  passport.authenticate('oauth', {session: false, failureRedirect: '/login'}),
  function (req, response) {
    console.log(req.user);
    accessToken = req.user.accessToken;
    response.redirect('/');
  }
);

router.get('/loggedIn', function(request,response){
  if (accessToken !== '') {
    response.send('logged in');
  } else {
    response.end();
  }
});

router.get('/api/userInfo', function(request, response){
  needle.get('http://user.sportngin.com/oauth/me?access_token=' + accessToken, function(err, resp){
    if (err) console.log(err);

    response.json(resp.body);
  });
});

router.get('/api/siteList', function(request, response){

  var options = {
    headers: {
      "Authorization": "Bearer " + accessToken,
      "Accept": "application/json",
      "NGIN-API-VERSION": "0.1"
    }
  };

  needle.get('https://api.sportngin.com/sites', options, function(err, resp){
    if (err) console.log(err);

    response.json(resp.body);
  });
});

router.get('/api/eventList/:siteId', function(request, response){
  var siteId = request.params.siteId;
  var options = {
    headers: {
      "Authorization": "Bearer " +  accessToken,
      "Accept": "application/vnd.ngin-api.v1,application/json",
      "Content-Type": "application/json"
    }
  };

  needle.get('https://api.sportngin.com/events?site_id=' + siteId + '&scope=site', options, function(err, resp){
    if (err) console.log(err);

    response.json(resp.body);
  });
});

router.get('/*', function(request, response){
  response.redirect('/');
});

module.exports = router;
