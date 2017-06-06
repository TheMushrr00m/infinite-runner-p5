// Nathaniel Troutman
//
// Based off of Daniel Shiffman
// https://github.com/CodingTrain/Rainbow-Code/blob/master/CodingChallenges/CC_32.2_agario_sockets/server.js

// Using express: http://expressjs.com/
var express = require('express');

// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 8000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://' + host + ':' + port);
}

// live reloading
var livereload = require('livereload');
var lrserver = livereload.createServer();
lrserver.watch(__dirname + "/public");

// server static content out of the public folder
app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

setInterval(heartbeat, 33);

function heartbeat() {
  io.sockets.emit('heartbeat', []);
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {

    console.log("We have a new client: " + socket.id);


    socket.on('start',
      function(data) {
        console.log(socket.id + " " + data);
        //var blob = new Blob(socket.id, data.x, data.y, data.r);
        blobs.push(blob);
      }
    );

    socket.on('update',
      function(data) {
        console.log(socket.id + " " + data);
      }
    );

    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);
