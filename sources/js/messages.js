(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};

  var _config = {
    autoCloseDelay: 3000
  };

  var _dom = {}, _overlay = {}, _message = {}, _confirmButton = {}, _cancelButton = {};
  var _stack = [];  // se arrivano più log allo stesso tempo, creo stack e li mostro uno alla volta
  var _isOpen = false, _autoCloseTimeout = false;

  function _setType (type) {
    _dom.className = "cloudnote-messages__panel cloudnote-messages__panel-" + type;
  }

  function _show (mandatory) {

    if (mandatory) {
      Utils.addGlobalStatus("cloudnote__MESSAGE-MANDATORY-OPEN");
    } else {
      Utils.addGlobalStatus("cloudnote__MESSAGE-OPEN");
      _autoCloseTimeout = setTimeout(_hide, _config.autoCloseDelay);
    }

  }

  function _hide () {

    Utils.removeGlobalStatus("cloudnote__MESSAGE-OPEN");
    Utils.removeGlobalStatus("cloudnote__MESSAGE-MANDATORY-OPEN");
    if (_autoCloseTimeout) {
      clearTimeout(_autoCloseTimeout);
      _autoCloseTimeout = false;
    }
    setTimeout(_onHide, 300);

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

  function alert (msg) {
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

    _dom = Utils.createDom("cloudnote-messages__panel");
    _overlay = Utils.createDom("cloudnote-messages__overlay");

    _message = Utils.createDom("cloudnote-messages__panel-text");
    _confirmButton = Utils.createDom("cloudnote-messages__panel-button-ok");
    _cancelButton = Utils.createDom("cloudnote-messages__panel-button-cancel");
    // aggiungere anche il campo input
    _dom.appendChild(_message);
    _dom.appendChild(_confirmButton);
    _dom.appendChild(_cancelButton);

    Param.container.appendChild(_overlay);
    Param.container.appendChild(_dom);
    Main.addRotationHandler(_onRotate);

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

})(cloudnote);
