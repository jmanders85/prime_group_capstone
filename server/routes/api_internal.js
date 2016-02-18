var express = require('express');
var pg = require('pg');
var router = express.Router();
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.get('/test', function(request, response){
  pg.connect(connectionString, function(err, client){
    if (err) throw err;
    var results = [];
    console.log("Connected to Postgres!");

    var query = client.query('SELECT * FROM assets;');

    query.on('row', function(row){
      console.log(JSON.stringify(row));
      results.push(row);
    });

    query.on('end', function(){
      client.end();
      response.send(results);
    });
  });
});


module.exports = router;
