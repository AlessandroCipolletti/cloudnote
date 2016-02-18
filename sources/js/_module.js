(function (app) {

  var _config = {

  };

  function _onRotate(e) {
    // do some stuff
  }

  function _initDom() {

    app.Main.addRotationHandler(_onRotate);

  }

  function _setConfig(params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  function init(params) {

    _setConfig(params);
    _initDom();

  }

  app.Main = {
    init: init
  };

})(cloudnote);
