var express = require('express');
var index = require('./routes/index');
var internal = require('./routes/api_internal');

var app = express();

app.use(express.static('server/public'));
app.use('/internal', internal);
app.use('/', index);

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log("Listening on port", port);
});
