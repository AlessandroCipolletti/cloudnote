/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};

  var _config = {
    autoCloseDelay: 2500
  };

  // TODO ovviamente tutti possono anche interagire con tastiera, invio ed escape
  // TODO input

  var _dom = {}, _overlay = {}, _message = {}, _confirmButton = {}, _cancelButton = {}, _panel = {}, _panelClose = {};
  var _stack = [];
  var _isOpen = false, _autoCloseTimeout = false, _panelIsOpen = false, _currentIsMandatory = false;

  function _setType (type) {

    _resetType();
    _dom.classList.add("drawith-messages__container-" + type);

  }

  function _resetType () {

    _dom.classList.remove(
      "drawith-messages__container-success",
      "drawith-messages__container-error",
      "drawith-messages__container-info",
      "drawith-messages__container-alert",
      "drawith-messages__container-confirm",
      "drawith-messages__container-input"
    );

  }

  function _show (mandatory) {

    _isOpen = true;
    _currentIsMandatory = mandatory;
    Utils.addGlobalStatus("drawith__MESSAGE-OPEN");
    if (mandatory) {
      Utils.addGlobalStatus("drawith__MESSAGE-MANDATORY-OPEN");
      Utils.fadeInElements(_overlay);
    } else {
      _autoCloseTimeout = setTimeout(_hide, _config.autoCloseDelay);
    }

  }

  function _hide (blockStack) {

    _isOpen = false;
    Utils.removeGlobalStatus("drawith__MESSAGE-OPEN");
    if (_currentIsMandatory) {
      Utils.removeGlobalStatus("drawith__MESSAGE-MANDATORY-OPEN");
      Utils.fadeOutElements(_overlay);
      _currentIsMandatory = false;
    }
    if (_autoCloseTimeout) {
      clearTimeout(_autoCloseTimeout);
      _autoCloseTimeout = false;
    }
    if (!blockStack) {
      setTimeout(_onHide, 200);
    }

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

  function _makeMessage (type, msg, mandatory) {

    if (_isOpen) {
      _stack.push({
        type: type,
        msg: msg,
        mandatory: mandatory
      });
    } else {
      _setType(type);
      _message.innerHTML = msg;
      setTimeout(function () {
        _show(mandatory);
      }, 16);
    }

  }

  function _onButtonClick (callback) {

    _hide();
    if (callback) {
      callback();
    }

  }

  function _removeAllListeners (button) {

    var newButton = button.cloneNode(true);
    button.parentNode.appendChild(newButton);
    button.parentNode.removeChild(button);
    return newButton;

  }

  function alert (msg, _callback) {

    if (_isOpen) {
      _hide(true);
    }
    _confirmButton = _removeAllListeners(_confirmButton);
    _confirmButton.addEventListener(Param.eventStart, _onButtonClick.bind({}, _callback));
    _makeMessage("alert", msg, true);

  }

  function info (msg) {
    _makeMessage("info", msg, false);
  }

  function success (msg) {
    _makeMessage("success", msg, false);
  }

  function error (msg) {
    _makeMessage("error", msg, false);
  }

  function confirm (msg, mandatory, onConfirm, onCancel) {

    mandatory = (typeof(mandatory) === "undefined" ? true : mandatory);
    if (_isOpen) {
      _hide(true);
    }
    _cancelButton = _removeAllListeners(_cancelButton);
    _confirmButton = _removeAllListeners(_confirmButton);
    _confirmButton.addEventListener(Param.eventStart, _onButtonClick.bind({}, onConfirm));
    _cancelButton.addEventListener(Param.eventStart, _onButtonClick.bind({}, onCancel));
    _makeMessage("confirm", msg, mandatory);

  }

  function input (msg, mandatory, onConfirm, onCancel) {

    _setType("input");
    mandatory = (typeOf(mandatory) === "undefined" ? false : mandatory);

  }

  function panel (content) {

    if (_panelIsOpen === false) {
      _panelIsOpen = true;
      content.classList.add("drawith-panel-content");
      _panel.innerHTML = "";
      _panel.appendChild(_panelClose);
      _panel.appendChild(content);
      Utils.fadeInElements([_panel, _overlay]);
    } else {
      _panelIsOpen = false;
    }

  }

  function _panelCloseClick (e) {

    e.preventDefault();
    if (_panelIsOpen) {
      Utils.fadeOutElements([_panel, _overlay]);
      _panelIsOpen = false;
    } else {
      _panelIsOpen = true;
    }

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    Main.loadTemplate("messages", {
      labelOk: "Ok",
      labelCancel: "Cancel"
    }, Param.container, function (templateDom) {

      _overlay = document.querySelector(".drawith-messages__overlay");
      _dom = document.querySelector(".drawith-messages__container");
      _message = _dom.querySelector(".drawith-messages__container-text");
      _confirmButton = _dom.querySelector(".drawith-messages__container-button-ok");
      _cancelButton = _dom.querySelector(".drawith-messages__container-button-cancel");
      _panel = document.querySelector(".drawith-messages__panel");
      _panelClose = _panel.querySelector(".drawith-messages__panel-close");
      _panelClose.addEventListener(Param.eventStart, _panelCloseClick);
      _overlay.addEventListener(Param.eventStart, function (e) {
        e.preventDefault();
      });
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
    input: input,
    panel: panel
  });

})(drawith);
