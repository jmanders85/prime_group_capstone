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

router.post('/newAsset', function(request, response){
  pg.connect(connectionString, function(err, client){

    var newAsset = {
      name: request.query.name,
      description: request.query.description,
      category: request.query.category,
      notes: request.query.notes
    };

    var query = client.query('INSERT INTO assets (name, description, category, notes) VALUES ($1, $2, $3, $4)', [newAsset.name, newAsset.description, newAsset.category, newAsset.notes]);


    query.on('end', function(){
      client.end();
      response.send("assets");
    });

    if(err) {
      console.log(err);
      response.send('error');
    }
  });
});

router.get('/getAssets', function(request, response){
  pg.connect(connectionString, function(err, client){
    var results = [];
    var query = client.query('SELECT * FROM assets;');

    query.on('row', function(row){
      results.push(row);
    });

    query.on('end', function(){
      client.end();
      response.send(results);
    });

    if(err) {
      console.log(err);
      response.send('error');
    }
  });
});


module.exports = router;
