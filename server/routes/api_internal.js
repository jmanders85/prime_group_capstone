var express = require('express');
var pg = require('pg');
var router = express.Router();
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.post('/newAsset', function(request, response){
  pg.connect(connectionString, function(err, client){

    var newAsset = {name: request.query.name,
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

router.post('/updateAsset', function(request, response){
  pg.connect(connectionString, function(err, client){

    var asset = {id: request.query.id,
                name: request.query.name,
                description: request.query.description,
                category: request.query.category,
                notes: request.query.notes
    };

    var query = client.query('UPDATE assets SET name=$1, description=$2, category=$3, notes=$4 WHERE id=$5', [asset.name, asset.description, asset.category, asset.notes, asset.id]);


    query.on('end', function(){
      client.end();
      response.send('view_assets');
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
    var query = client.query('SELECT * FROM assets ORDER BY id');

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

router.post('/reservation', function(request, response){
  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    var newReservationId;
    var assetsReservationsQuery = 'INSERT INTO assets_reservations (asset_id, reservation_id) VALUES ';

    client
      .query('INSERT INTO reservations (event_id, reserved_by) VALUES ($1, $2)', [parseInt(request.body.eventId), request.body.reservedBy]);

    client
      .query('SELECT * FROM reservations ORDER BY id DESC LIMIT 1')
      .on('row', function(row){
        newReservationId = row.id;
      })
      .on('end', function(){
        for (var i = 0; i < request.body.selectedAssets.length; i++) {
          assetsReservationsQuery += '('+ request.body.selectedAssets[i] +', '+ newReservationId +')';
          if (i !== request.body.selectedAssets.length - 1) {
            assetsReservationsQuery += ', ';
          }
        }
        client
          .query(assetsReservationsQuery)
          .on('end', function(){
            done();
            return response.sendStatus(200);
          });
      });
  });
});


module.exports = router;
