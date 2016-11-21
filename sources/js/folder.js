/*
  Documentations:

*/

(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Editor = {};

  var _config = {
    topnavHeight: 50.5
  };

  var _container = {}, _drawingsContainer = {}, _deleteButton = {};

  function show () {

    Utils.addGlobalStatus("drawith__FOLDER-OPEN");
    Utils.fadeInElements(_container);

  }

  function hide () {

    Utils.removeGlobalStatus("drawith__FOLDER-OPEN");
    Utils.fadeOutElements(_container);

  }

  function _deleteButtonClick (e) {

    e.preventDefault();

  }

  function _onTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    if (e.target.classList.contains("drawith-folder__drawing-new")) {
      hide();
      Editor.show();
    } else {
      // TODO open the seleted draw preloaded into editor
    }

  }

  function _initDb () {

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    Main.loadTemplate("folder", {
      drawings: []  // TODO
    }, Param.container, function (templateDom) {

      _container = templateDom;
      _container.style.top = Param.headerSize + "px";
      _container.style.height = "calc(100% - " + Param.headerSize + "px)";
      _container.querySelector(".drawith-folder__topbar").style.height = _config.topnavHeight + "px";
      _deleteButton = _container.querySelector(".drawith-folder__topbar-button-delete");
      _deleteButton.addEventListener(Param.eventStart, _deleteButtonClick);
      _drawingsContainer = _container.querySelector(".drawith-folder__drawings-container");
      _drawingsContainer.style.height = "calc(100% - " + _config.topnavHeight + "px)";
      _drawingsContainer.style.top = _config.topnavHeight + "px";
      _drawingsContainer.addEventListener(Param.eventStart, _onTouchStart, true);
      Main.addRotationHandler(_onRotate);
      show();

    });

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Editor = app.Editor;
    _config = Utils.setConfig(params, _config);
    _config.topnavHeight *= Param.pixelRatio;
    _initDb();
    _initDom();

  }

  app.module("Folder", {
    init: init,
    show: show,
    hide: hide
  });

})(drawith);
