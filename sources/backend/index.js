var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);


var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

if (true) {
	var db = "dev";
	var port = 5000;
} else {
	var db = "prod";
	var port = 4000;
}



MongoClient.connect("mongodb://localhost:27017/" + db, function(err, db) {

	console.log("db connected \n");

	var Users = db.collection("users");
	var Draws = db.collection("draws");


	io.on("connection", function (socket) {

		console.log("Connection: " + socket.id);

		socket.on("disconnect", function() {
			console.log("Disconnect: " + socket.id);
		});

		socket.on("error", function() {
			console.log("Socket error: " + socket.id);
		});

		/*
	  socket.emit('news', { hello: 'world' });
	  socket.on('my other event', function (data) {
	    console.log(data);
	  });
		*/

	});


	http.listen(port, function() {
	  console.log("listening DEV on *:" + port + " \n");
	});


});
