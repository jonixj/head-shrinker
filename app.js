var express = require('express'),
  app = express();

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/assets',  express.static(__dirname + '/assets'));

app.listen(3000, function () {
  console.log('Server running.');
});