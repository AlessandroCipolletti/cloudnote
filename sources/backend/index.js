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

MongoClient.connect("mongodb://localhost:27017/" + db, function (err, db) {

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

  function _onUserLoginQueryError(error) {
    console.log("User query error: " + error + " \n");
    socket.emit("user login", "error");
  }

  function _arrayFilterOnlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  var _logout = (function () {

    var msgClose = JSON.stringify({
      type: "coworking close"
    });
    var roomId = 0;
    var s = {};
    var sockets = {};
    var socketsIds = [];
    var i = 0;

    return function (socket) {

      roomId = socket.connectedRoom;
      if (roomId) {
        socket.broadcast.to(roomId).emit("editor", msgClose);
        sockets = io.sockets.adapter.rooms[roomId].sockets;
        socketsIds = Object.keys(sockets);
        for (i = socketsIds.length; i--;) {
          if (sockets[socketsIds[i]] === true) {
            s = io.sockets.connected[socketsIds[i]];
            s.leave(roomId);
            s.connectedRoom = false;
            s = undefined;
          }
        }
        sockets = undefined;
      }

    };

  })();

  /*
  function makesID () {
    var id = "", i = 0, MATH = Math, possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var l = possible.length;
    return function () {
      text = "";
      for (i = 0; i < 5; i++) {
        text += possible.charAt(MATH.floor(MATH.random() * l));
      }
      return text;
    };
  }
  */

  var _roomsIds = [];
  var _roomIdsOwners = [];

  var _generateRoomID = (function () {

    var MATH = Math;
    var min = 40000;
    var tot = 1000000000;
    var id;

    return function () {
      do {
        id = (MATH.floor(MATH.random() * tot) + min).toString(36).toUpperCase();
      } while (_roomsIds.indexOf(id) >= 0);
      return id;

    };

  })();

  io.on("connection", function (socket) {

    log("Connection: " + socket.id);

    socket.on("disconnect", (function () {

      var index = 0;

      return function () {

        log("Disconnect: " + socket.id);
        index = _roomsIds.indexOf(socket.roomId);
        _roomsIds.splice(index, 1);
        _roomIdsOwners.splice(index, 1);
        _logout(socket);

      };

    })());

    socket.on("error", function () {
      console.log("Socket error: " + socket.id);
    });

    socket.emittedDraws = [];
    socket.roomId = _generateRoomID();
    socket.connectedRoom = false;
    _roomsIds.push(socket.roomId);
    _roomIdsOwners.push(socket.id);
    socket.emit("editor", JSON.stringify({
      type: "roomId",
      id: socket.roomId
    }));

    socket.on("editor coworking request", (function () {

      var index = 0;
      var s;
      var msgOk = JSON.stringify({
        type: "coworking started"
      });
      var msgErrorCode = JSON.stringify({
        type: "coworking error",
        error: "wrong code"
      });
      var msgErrorConnected = JSON.stringify({
        type: "coworking error",
        error: "wrong code"
      });

      return function (data) {

        data = JSON.parse(data);
        index = _roomsIds.indexOf(data.roomId);
        log("socket " + socket.id + " request id " + data.roomId + " found at index " + index);

        if (index >= 0 && data.roomId !== socket.roomId && socket.connectedRoom === false) {
          s = io.sockets.connected[_roomIdsOwners[index]];
          if (s.connectedRoom) {
            socket.emit("editor", msgErrorConnected);
          } else {
            socket.join(data.roomId);
            socket.connectedRoom = data.roomId;
            socket.emit("editor", msgOk);
            s.join(data.roomId);
            s.connectedRoom = data.roomId;
            s.emit("editor", msgOk);
          }
          s = undefined;
        } else {
          socket.emit("editor", msgErrorCode);
        }

      };

    })());

    socket.on("editor coworking stop", _logout.bind({}, socket));

    socket.on("user login", function (data) {

      var user = JSON.parse(data);
      if (user.id) { // aggiunta di un social ad un utente già esistente, o semplice login
        // TODO aggiorno i dati che ho ricevuto a db
        socket.emit("user login", JSON.stringify({
          id: user.id,
          "new": false
        }));
        log("new social for user " + user.id);
      } else { // primo login per la sessione corrente - TODO Google
        if (user.fb.id || user.google.id) {
          MongoFind(
            Users.find({
              "fb.id": user.fb.id
            }).limit(1),
            function (userDb) {
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
      Draws.insert(draw, function (err, item) {
        log("new draw from " + socket.id + ". id: ", item._id);
        socket.emit("editor", JSON.stringify({
          type: "save",
          ok: true,
          id: item._id
        }));
      });

    });

    socket.on("editor steps", function (data) {

      socket.broadcast.to(socket.connectedRoom).emit("editor", data);
      console.log("steps: " + JSON.parse(data).steps.length + " room: " + socket.connectedRoom);

    });

    socket.on("dashboard drag", function (data) {

      data = JSON.parse(data);
      var _ids = data.ids;
      var ids = [];

      for (var i = _ids.length; i--;) {
        if (_ids[i].length) {
          ids.push(ObjectId(_ids[i]));
        }
      }
      ids = ids.concat(socket.emittedDraws).filter(_arrayFilterOnlyUnique);

      MongoFind(
        Draws.find({
          _id: {
            $nin: ids
          },
          x: {
            $lt: data.area.maxX
          },
          y: {
            $lt: data.area.maxY
          },
          r: {
            $gt: data.area.minX
          },
          b: {
            $gt: data.area.minY
          }
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

  http.listen(port, function () {
    console.log("listening " + (DEV ? "DEV" : "PROD") + " on *:" + port + " \n");
  });

});
