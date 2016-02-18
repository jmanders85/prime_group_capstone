var express = require('express');
var pg = require('pg');
var router = express.Router();
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.get('/test', function(){
  pg.connect(connectionString, function(err, client){
    if (err) throw err;
    var query;
    var results = [];
    console.log("Connected to Postgres!");

    query = client.query('SELECT * FROM assets;');

    query.on('row', function(row){
      console.log(JSON.stringify(row));
      results.push(row);
    });

    query.on('end', function(){
      client.end();
      response.json(results);
    });
  });
});


module.exports = router;
