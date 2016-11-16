(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Messages = {};

  var _config = {

  };

  var _container = {};
  var _buttonWidth = 65;
  var _rightCounter = 0, _leftCounter = 0;

  function addButton (button, side) {

    button.classList.add("drawith-header__button");
    if (side === "right") {
      button.style.right = _rightCounter * _buttonWidth * Param.pixelRatio + "px";
      _rightCounter++;
    } else {
      button.style.left = _leftCounter * _buttonWidth * Param.pixelRatio + "px";
      _leftCounter++;
    }
    _container.appendChild(button);

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = Utils.createDom("drawith-header__container");
    var logo = document.createElement("div");
    logo.classList.add("drawith-header__logo");
    _container.appendChild(logo);
    Param.container.appendChild(_container);
    Main.addRotationHandler(_onRotate);

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Messages = app.Messages;
    _config = Utils.setConfig(params, _config);
    _initDom();
    Param.headerSize = 50.5 * Param.pixelRatio;

    Main.loadTemplate("panel/info", {
      version: Param.appVersion
    }, Param.container, function (templateDom) {

      templateDom.parentNode.removeChild(templateDom);
      var infoButton = Utils.createDom("drawith-header__info-button");
      infoButton.addEventListener(Param.eventStart, function (e) {
        e.preventDefault();
        Messages.panel(templateDom);
      });
      addButton(infoButton, "right");

    });

  }

  app.module("Header", {
    init: init,
    addButton: addButton
  });

})(drawith);
