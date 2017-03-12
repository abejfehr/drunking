var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var CerealPort = require("serialport");
var express = require('express');

// Serve static files
app.use(express.static('public'))

// Create new serialport pointer
// var cereal = new CerealPort("/" , { baudrate : 9600 });

// Add data read event listener
// cereal.on("data", function (score) {
  // io.emit('score', score);
// });

// For testing
// setInterval(function () {
//   io.emit('score', Math.random() * 1024);
// }, 3000);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
