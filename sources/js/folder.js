/*
  Documentations:

*/

(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Editor = {};
  var MATH = Math;

  var _config = {
    topnavHeight: 50.5
  };

  var _container = {}, _drawingsContainer = {}, _selectButton = {}, _doneButton = {}, _exportButton = {}, _deleteButton = {};
  var _dragged = false, _currentScroll = 0, _toolsMaxScroll = 0;
  var _selectText = "Select", _doneText = "Done";

  function show () {

    // TODO questo modulo va cambiato. non è su init che bisogna riempire il container ma su show. per aggiungere il disegno appena salvato
    // in più quel metodo sarà utile anche per aggiornare la grafica dopo il cestino
    Utils.addGlobalStatus("drawith__FOLDER-OPEN");
    _drawingsContainer.scrollTop = 0;
    Utils.fadeInElements(_container);

  }

  function hide () {

    Utils.removeGlobalStatus("drawith__FOLDER-OPEN");
    Utils.fadeOutElements(_container);

  }

  function saveNew (draw) {
    // TODO sincono
  }

  function saveDraft (draw) {
    // TODO asincrono
  }

  function deleteDraft (idDraw) {
    // TODO asincrono
  }

  function _selectButtonClick () {

    if (_selectButton.classList.contains("disabled") || _doneButton.classList.contains("displayNone")) return;

  }

  function _doneButtonClick () {

    if (_doneButton.classList.contains("disabled") || _doneButton.classList.contains("displayNone")) return;

  }

  function _exportButtonClick () {

    if (_exportButton.classList.contains("disabled")) return;

  }

  function _deleteButtonClick () {

    if (_deleteButton.classList.contains("disabled")) return;

  }

  function onTopnavTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    if (e.target === _selectButton) {
      _selectButtonClick();
    } else if (e.target === _doneButton) {
      _doneButtonClick();
    } else if (e.target === _exportButton) {
      _exportButtonClick();
    } else if (e.target === _deleteButton) {
      _deleteButtonClick();
    }

  }

  function _onTouchStart (e) {

    if (e.type.indexOf("mouse") >= 0 && e.button > 0) {
      e.preventDefault();
      return;
    }
    if (_drawingsContainer.scrollTop === 0) {
      _currentScroll = _drawingsContainer.scrollTop = 1;
    } else if (_drawingsContainer.scrollTop === _toolsMaxScroll) {
      _currentScroll = _drawingsContainer.scrollTop = _toolsMaxScroll - 1;
    } else {
      _currentScroll = _drawingsContainer.scrollTop;
    }

  }

  function _onTouchEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    if (MATH.abs(_currentScroll - _drawingsContainer.scrollTop) > 10) {
      return;
    }
    _currentScroll = 0;
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
      selectText: _selectText,
      doneText: _doneText,
      drawings: []  // TODO
    }, Param.container, function (templateDom) {

      _container = templateDom;
      _container.style.top = Param.headerSize + "px";
      _container.style.height = "calc(100% - " + Param.headerSize + "px)";
      _container.querySelector(".drawith-folder__topbar").style.height = _config.topnavHeight + "px";
      _selectButton = _container.querySelector(".drawith-folder__topbar-button-select");
      _doneButton = _container.querySelector(".drawith-folder__topbar-button-done");
      _exportButton = _container.querySelector(".drawith-folder__topbar-button-export");
      _deleteButton = _container.querySelector(".drawith-folder__topbar-button-delete");
      _container.querySelector(".drawith-folder__topbar").addEventListener(Param.eventStart, onTopnavTouchStart, true);
      _drawingsContainer = _container.querySelector(".drawith-folder__drawings-container");
      _drawingsContainer.style.height = "calc(100% - " + _config.topnavHeight + "px)";
      _drawingsContainer.style.top = _config.topnavHeight + "px";
      _drawingsContainer.addEventListener(Param.eventStart, _onTouchStart, true);
      _drawingsContainer.addEventListener(Param.eventEnd, _onTouchEnd, true);
      _toolsMaxScroll = _drawingsContainer.scrollHeight - _drawingsContainer.clientHeight;
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
    hide: hide,
    saveNew: saveNew,
    saveDraft: saveDraft,
    deleteDraft: deleteDraft
  });

})(drawith);
