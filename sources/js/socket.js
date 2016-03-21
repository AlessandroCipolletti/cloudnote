(function (app) {

  var _config = {

  };

  var _socket = {};
  var _buffer = [];

  function _onError () {

  }

  function init (params) {

    _config = app.Utils.setConfig(params, _config);

    function _onConnect () {

      var data;
      for (var i = _buffer.length; i--;) {
        data = _buffer.pop();
        _socket.io.emit(data[0], data[1]);
      }

    }

    _socket = {
      url: app.Param.socketUrl,
      io: io(app.Param.socketUrl)
    };

    _socket.io.on("error", function () {
      console.log("socket error");
    });
    _socket.io.on("disconnect", function () {
      console.log("socket disconnect");
    });
    _socket.io.on("reconnect", function () {
      _onConnect();
    });
    _socket.io.on("connect", function () {
      console.log("Socket Connect OK");
      _onConnect();
    });

    _socket.io.on("user login", app.User.onSocketLogin);
    _socket.io.on("dashboard drag", app.Dashboard.onSocketMessage);
    _socket.io.on("editor save", app.Editor.onSocketMessage);

  }

  function isConnected () {
    return _socket.io.connected;
  }

  function emit (event, data) {

    (typeof data === "object") && (data = JSON.stringify(data));
    if (_socket.io.connected) {
      _socket.io.emit(event, data);
    } else {
      _buffer.push([event, data]);
    }

  }

  app.module("Socket", {
    init: init,
    emit: emit,
    isConnected: isConnected
  });

})(cloudnote);
