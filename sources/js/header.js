(function (app) {

  var _config = {

  };

  var _container = {};
  var _buttonWidth = 130;
  var _rightCounter = 0, _leftCounter = 0;

  function addButton (button, side) {

    button.classList.add("cloudnote-header__button");
    if (side === "right") {
      button.style.right = _rightCounter * _buttonWidth + "px";
      _rightCounter++;
    } else {
      button.style.left = _leftCounter * _buttonWidth + "px";
      _leftCounter++;
    }
    _container.appendChild(button);

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = document.createElement("div");
    _container.classList.add("cloudnote-header__container");
    var logo = document.createElement("div");
    logo.classList.add("cloudnote-header__logo");
    _container.appendChild(logo);
    app.Param.container.appendChild(_container);
    app.Main.addRotationHandler(_onRotate);

  }

  function _setConfig (params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  function init (params) {

    _setConfig(params);
    _initDom();
    app.Param.headerSize = 101;

  }

  app.Header = {
    init: init,
    addButton: addButton
  };

})(cloudnote);
