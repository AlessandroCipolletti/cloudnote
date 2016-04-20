var DEV = true;

var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);


var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

if (DEV) {
  var db = "dev";
  var port = 5000;
  var log = function (msg) {
    console.log(msg + " \n");
  };
} else {
  var db = "prod";
  var port = 4000;
  var log = function () {};
}



MongoClient.connect("mongodb://localhost:27017/" + db, function(err, db) {

  log("db connected");

  var Users = db.collection("users");
  var Draws = db.collection("draws");
  var MongoFind = function (cursor, callback, onError) {
    cursor.customResult = [];
    cursor.each(function (err, item) {
      if (err) {
        if (onError) {
          onError(err);
        }
      } else if (item) {
        cursor.customResult.push(item);
      } else {
        if (cursor.customResult.length === 0) {
          callback(false);
        } else if (cursor.customResult.length === 1) {
          callback(cursor.customResult[0]);
        } else {
          callback(cursor.customResult);
        }
        cursor = undefined;
      }
    });
  };


  function _onUserLoginQueryError (error) {
    console.log("User query error: " + error + " \n");
    socket.emit("user login", "error");
  }

  function _arrayFilterOnlyUnique (value, index, self) {
    return self.indexOf(value) === index;
  }


  var roomsIds = [];

  io.on("connection", function (socket) {

    log("Connection: " + socket.id);

    socket.join("coworking");


    socket.on("disconnect", function() {
      log("Disconnect: " + socket.id);
      roomsIds.splice(roomsIds.indexOf(socket.roomId), 1);
    });

    socket.on("error", function() {
      console.log("Socket error: " + socket.id);
    });


    socket.emittedDraws = [];
    socket.roomId = "0"; // generare una room id univoca
    roomsIds.push(socket.roomId);
    socket.emit("editor", JSON.stringify({
      type: "roomId",
      id: socket.roomId
    }));


    socket.on("user login", function (data) {

      var user = JSON.parse(data);
      if (user.id) {  // aggiunta di un social ad un utente già esistente, o semplice login
        // TODO aggiorno i dati che ho ricevuto a db
        socket.emit("user login", JSON.stringify({
          id: user.id,
          "new": false
        }));
        log("new social for user " + user.id);
      } else {    // primo login per la sessione corrente - TODO Google
        if (user.fb.id || user.google.id) {
          MongoFind(
            Users.find({
              "fb.id": user.fb.id
            }).limit(1),
            function ( userDb) {
              if (userDb) {
                socket.emit("user login", JSON.stringify({
                  id: userDb._id,
                  "new": false
                }));
                log("login existing user " + userDb._id);
              } else {
                Users.insertOne(user, function (err, newItem) {
                  socket.emit("user login", JSON.stringify({
                    id: newItem._id,
                    "new": true
                  }));
                  log("login new user " + newItem._id);
                });
              }
            },
            _onUserLoginQueryError
          );
        }
      }

    });


    socket.on("editor save", function (data) {

      var draw = JSON.parse(data);
      Draws.insert(draw, function(err, item) {
        log("new draw from " + socket.id + ". id: ", item._id);
        socket.emit("editor", JSON.stringify({
          type: "save",
          ok: true,
          id: item._id
        }));
      });

    });


    socket.on("editor steps", function (data) {

      socket.broadcast.to("coworking").emit("editor", data);
      console.log("steps: " + JSON.parse(data).steps.length);

    });


    socket.on("dashboard drag", function (data) {

      data = JSON.parse(data);
      var _ids = data.ids;
      var ids = [];

      for (var i = _ids.length; i--; ) {
        if (_ids[i].length) {
          ids.push(ObjectId(_ids[i]));
        }
      }
      ids = ids.concat(socket.emittedDraws).filter(_arrayFilterOnlyUnique);

      MongoFind(
        Draws.find({
          _id    : { $nin : ids },
          x    : { $lt : data.area.maxX },
          y    : { $lt : data.area.maxY },
          r    : { $gt : data.area.minX },
          b    : { $gt : data.area.minY }
        }).limit(100),
        function (draws) {
          if (draws) {
            log("drag: 0 rows found");
            socket.emit("dashboard drag", "none");
          } else {
            log("drag: " + draws.length + " rows found");
            draws.forEach(function (draw) {
              if (socket.emittedDraws.indexOf(draw._id) < 0) {
                socket.emittedDraws.push(draw._id);
              }
              draw.id = draw._id;
              delete draw._id;
              MongoFind(
                Users.find({
                  _id: ObjectId(draw.userId)
                }).limit(1),
                function (user) {
                  draw.user = user;
                  if (draw.user) {
                    draw.user.id = draw.user._id;
                    delete draw.user._id;
                    delete draw.userId;
                  }
                  log([draw.id, draw.x, draw.y]);
                  socket.emit("dashboard drag", JSON.stringify([draw]));
                  draw = undefined;
                }
              );
            });
            socket.emit("dashboard drag", "end");
          }
        },
        function (error) {
          console.log("query error: ", error);
          socket.emit("dashboard drag", "error");
        }
      );

    });


  });


  http.listen(port, function() {
    console.log("listening " + (DEV ? "DEV": "PROD") +" on *:" + port + " \n");
  });


});
