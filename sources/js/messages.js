(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};

  var _config = {
    autoCloseDelay: 2500
  };

  var _dom = {}, _overlay = {}, _message = {}, _confirmButton = {}, _cancelButton = {};
  var _stack = [];  // se arrivano più log allo stesso tempo, creo stack e li mostro uno alla volta
  var _isOpen = false, _autoCloseTimeout = false;

  function _setType (type) {
    _dom.className = "drawith-messages__panel drawith-messages__panel-" + type;
  }

  function _show (mandatory) {

    _isOpen = true;
    if (mandatory) {
      Utils.addGlobalStatus("drawith__MESSAGE-MANDATORY-OPEN");
    } else {
      Utils.addGlobalStatus("drawith__MESSAGE-OPEN");
      _autoCloseTimeout = setTimeout(_hide, _config.autoCloseDelay);
    }

  }

  function _hide () {

    _isOpen = false;
    Utils.removeGlobalStatus("drawith__MESSAGE-OPEN");
    Utils.removeGlobalStatus("drawith__MESSAGE-MANDATORY-OPEN");
    if (_autoCloseTimeout) {
      clearTimeout(_autoCloseTimeout);
      _autoCloseTimeout = false;
    }
    setTimeout(_onHide, 200);

  }

  function _onHide () {

    var message = _stack.splice(0, 1)[0];
    if (message) {
      if (message.type === "input" || message.type === "confirm") {
        app.Messages[message.type](message.msg, message.mandatory, message.onConfirm, message.onCancel);
      } else {
        app.Messages[message.type](message.msg);
      }
    }

  }

  function _simpleMessage (type, msg, mandatory) {

    if (_isOpen) {
      _stack.push({
        type: type,
        msg: msg
      });
    } else {
      _setType(type);
      _message.innerHTML = msg;
      _show(mandatory);
    }

  }

  function _onAlertOk (callback) {

    _confirmButton.removeEventListener(Param.eventStart, _onAlertOk);
    _hide();
    if (callback) {
      callback();
    }

  }

  function alert (msg, _callback) {

    _confirmButton.addEventListener(Param.eventStart, _onAlertOk.bind({}, _callback));
    _simpleMessage("alert", msg, true);

  }

  function info (msg) {
    _simpleMessage("info", msg, false);
  }

  function success (msg) {
    _simpleMessage("success", msg, false);
  }

  function error (msg) {
    _simpleMessage("error", msg, false);
  }

  function confirm (msg, mandatory, onConfirm, onCancel) {
    // TODO due pulsanti di conferma o annulla. con parametro per decidere se è bloccante o si puo' chiudere
    _setType("confirm");
    mandatory = (typeOf(mandatory) === "undefined" ? true : mandatory);

  }

  function input (msg, mandatory, onConfirm, onCancel) {
    // TODO con campo di input. con parametro per decidere se è bloccante o si puo' chiudere
    _setType("input");
    mandatory = (typeOf(mandatory) === "undefined" ? false : mandatory);

  }

  // TODO ovviamente tutti posso anche interagire con tastiera, invio ed escape

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    Main.loadTemplate("messages", {
      labelOk: "OK",
      labelCancel: "Cancel"
    }, Param.container, function (templateDom) {

      _overlay = document.querySelector(".drawith-messages__overlay");
      _dom = document.querySelector(".drawith-messages__panel");
      _message = _dom.querySelector(".drawith-messages__panel-text");
      _confirmButton = _dom.querySelector(".drawith-messages__panel-button-ok");
      _cancelButton = _dom.querySelector(".drawith-messages__panel-button-cancel");

      Main.addRotationHandler(_onRotate);

    });

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    _config = Utils.setConfig(params, _config);
    _initDom();

  }

  app.module("Messages", {
    init: init,
    alert: alert,
    info: info,
    success: success,
    error: error,
    confirm: confirm,
    input: input
  });

})(drawith);
