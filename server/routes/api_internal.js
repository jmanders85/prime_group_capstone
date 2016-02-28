var express = require('express');
var pg = require('pg');
var router = express.Router();
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

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

router.post('/updateAsset', function(request, response){
  pg.connect(connectionString, function(err, client){

    var asset = {
      id: request.query.id,
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
    var orderBy = 'name';
    var keyword = request.query.keyword || '%%';

    if(request.query.sortBy === 'Category'){
      orderBy = 'category';
    }else if (request.query.sortBy === 'Recently Created'){
      orderBy = 'id DESC';
    }else if (request.query.sortBy === 'Name'){
      orderBy = 'name';
    }

    var query = client.query('SELECT * FROM assets WHERE LOWER(name) LIKE LOWER($1) ORDER BY ' + orderBy + ';', [keyword]);

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

router.delete('/asset/:id', function(request, response){
  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    client
      .query('DELETE FROM assets WHERE id = $1', [request.params.id])
      .on('end', function(){
        done();
        response.sendStatus(200);
      });
  });
});

router.get('/getBadRes', function(request, response){
  pg.connect(connectionString, function(err, client, done){
   if (err) throw err;

    var results = [];
    var query = client.query('SELECT * FROM reservations WHERE event_id = $1 ORDER BY id', [request.query.event_id]);
    query.on('row', function(row){
      results.push(row);
    });

    query.on('end', function() {
          done();
          return response.json(results);
        });

    });

});

router.get('/getAvailable', function(request, response){
  pg.connect(connectionString, function(err, client, done){
   if (err) throw err;
    var results = [];
    // console.log(request.query.event_list);

    var str = request.query.event_list.length - 1;
    var event_list = request.query.event_list.slice(1, str);

    var query = client.query('SELECT assets.name, assets.id, assets.description, assets.category, assets.notes FROM assets EXCEPT SELECT assets.name, assets.id, assets.description, assets.category, assets.notes FROM assets JOIN assets_reservations ON assets.id = assets_reservations.asset_id JOIN reservations ON assets_reservations.reservation_id = reservations.id WHERE reservations.event_id IN (' + event_list + ') ORDER BY name');

    query.on('row', function(row){
      results.push(row);
    });

    query.on('end', function() {
          done();
          return response.json(results);
        });

    });
});

router.get('/getEventsByAsset', function(request, response){
  pg.connect(connectionString, function(err, client, done){
   if (err) throw err;
    var results = [];

    var query = client.query('SELECT reservations.event_id FROM reservations JOIN assets_reservations ON reservations.id = assets_reservations.reservation_id JOIN assets ON assets_reservations.asset_id = assets.id WHERE assets.id = $1', [request.query.asset_id]);

    query.on('row', function(row){
      results.push(row);
    });

    query.on('end', function() {
          done();
          return response.json(results);
        });

    });
});

router.get('/getReservations', function(request, response){
  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    var results = [];
    var query = client.query('SELECT * FROM reservations ORDER BY id');
    query.on('row', function(row){
      row.assets = [];
      results.push(row);
    });

    query.on('end', function(){
      client
        .query('select assets.name, assets.id, assets_reservations.reservation_id FROM assets JOIN assets_reservations ON assets.id = assets_reservations.asset_id')
        .on('row', function(row){
          for (var i = 0; i < results.length; i++) {
            if (results[i].id === row.reservation_id) {
              results[i].assets.push(row);
              continue;
            }
          }
        })
        .on('end', function() {
          done();
          return response.json(results);
        });

    });
  });
});

router.get('/assetReservations/:id', function(request, response){
  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    var results = [];

    client.query('SELECT reservations.reserved_by, reservations.event_id, reservations.id, assets_reservations.asset_id FROM reservations INNER JOIN assets_reservations ON assets_reservations.reservation_id = reservations.id WHERE assets_reservations.asset_id = $1', [request.params.id]).on('row', function(row){
      row.assets = [];
      results.push(row);
    })
    .on('end', function() {
      client
        .query('select assets.name, assets.id, assets_reservations.reservation_id FROM assets JOIN assets_reservations ON assets.id = assets_reservations.asset_id')
        .on('row', function(row){
          for (var i = 0; i < results.length; i++) {
            if (results[i].id === row.reservation_id) {
              results[i].assets.push(row);
              continue;
            }
          }
        })
        .on('end', function() {
          done();
          return response.json(results);
        });
    });
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

router.put('/reservation', function(request, response){
  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    var assetsReservationsQuery = 'INSERT INTO assets_reservations (asset_id, reservation_id) VALUES ';

    client
      .query('UPDATE reservations SET event_id=$1, reserved_by=$2 WHERE id=$3', [parseInt(request.body.eventId), request.body.reservedBy, request.body.id]);

    client
      .query('DELETE FROM assets_reservations WHERE reservation_id = $1', [request.body.id])
      .on('end', function(){
        for (var i = 0; i < request.body.selectedAssets.length; i++) {
          assetsReservationsQuery += '('+ request.body.selectedAssets[i] +', '+ request.body.id +')';
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

router.delete('/reservation/:id', function(request, response){

  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    client
      .query('DELETE FROM assets_reservations WHERE reservation_id = $1', [request.params.id])
      .on('end', function(){
        client
          .query('DELETE FROM reservations WHERE id = $1', [request.params.id])
          .on('end', function(){
            done();
            response.sendStatus(200);
          });
      });
  });

});


module.exports = router;
