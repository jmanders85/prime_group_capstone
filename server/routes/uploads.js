/**
 * Created by NathanBriscoe on 3/2/16.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
//var Upload = require('../models/upload');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var pg = require('pg');


router.post('/', upload.single('file'), function(request, response, next){
    console.log(request.body);
    console.log(request.file);
    response.json(request.file);
});

router.get('/', function(request, response, next){
    Upload.find({}, function(err, uploads){
        if(err) next(err);
        else {
            console.log(uploads);
            response.json(uploads);
        }
    });
});

router.get('/:uuid/:filename', function(request, response, next){//uuid = universally unique id. Here we're actually requiring the route /:uuid/:filename, which is the route to include the UUID of the file (the pseudo-random name Multer generated) and the filename. Should match the ng-href from the html
    console.log(request.params);
    Upload.findOne({
        'file.filename': request.params.uuid,
        'file.originalname': request.params.filename
    }, function (err, upload){
        if(err) next(err);
        else{
            response.set({
                "Content-Disposition": 'attachment; filename="' + upload.file.originalname + '"',
                "Content-Type": upload.file.mimetype//Media Type
            });
            fs.createReadStream(upload.file.path).pipe(response);//using fs (FileSystem) we pipe the read stream into the response which initiates download of the file.
        }
    });
});

module.exports = router;

