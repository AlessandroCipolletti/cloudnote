(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Editor = {};
  var Dashboard = {};

  var _config = {
    tools: [],
    toolsSide: "right"
  };

  // TODO aggiungere doppio tap su tool, per scorrere verso sinistra la barra degli strumenti e poter scegliere la dimensione o altre cose
  var _container = {};
  var _undoButton = false, _redoButton = false, _saveButton = false;
  var _toolsFunctions = {
    marker: function () {

      _selectTool("marker");
      Editor.setTool({
        name: "marker",
        size: 8,
        forceFactor: 1.5,
        speedFactor: 0,
        shape: "circle",
        globalCompositeOperation: "source-over",
        cursor: false
      });

    },
    pencil: function () {

      _selectTool("pencil");
      Editor.setTool({
        name: "pencil",
        size: 3,
        forceFactor: 0,
        speedFactor: 0,
        shape: "particles",
        globalCompositeOperation: "source-over",
        cursor: false
      });

    },
    eraser: function () {

      _selectTool("eraser");
      Editor.setTool({
        name: "eraser",
        size: 12,
        forceFactor: 5,
        speedFactor: 0,
        shape: "circle",
        globalCompositeOperation: "destination-out",
        cursor: true
      });

    },
    undo: function () {
      Editor.undo();
    },
    redo: function () {
      Editor.redo();
    },
    clear: function () {
      Editor.clear();
    },
    paper: function () {
      Editor.changePaper();
    },
    save: function () {
      Editor.save();
    },
    exit: function () {
      Editor.hide();
      Dashboard.show();
    }
  };

  function toggleButton (tool, enabled) {

    var button = false;
    if (_config.tools.indexOf(tool) >= 0) {

      if (tool === "undo") {
        button = _undoButton;
      } else if (tool === "redo") {
        button = _redoButton;
      } else if (tool === "save") {
        button = _saveButton;
      }

      if (button) {
        if (enabled) {
          button.classList.remove("disabled");
        } else {
          button.classList.add("disabled");
        }
      }

    }

  }

  function _selectTool (tool) {

    var selected = _container.querySelector(".cloudnote-editor-tools__tool-selected");
    if (selected) {
      selected.classList.remove("cloudnote-editor-tools__tool-selected");
    }
    _container.querySelector(".cloudnote-editor-tools__tool-" + tool).classList.add("cloudnote-editor-tools__tool-selected");

  }

  function _onTouchStart (e) {

    var target = e.target;
    if (
      target.classList.contains("cloudnote-editor-tools__tool") &&
      !target.classList.contains("cloudnote-editor-tools__tool-selected") &&
      !target.classList.contains("disabled")
    ) {

      var tool = target.getAttribute("data-tool");
      if (_toolsFunctions.hasOwnProperty(tool)) {
        (_toolsFunctions[tool])();
      }

    }

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom (moduleContainer) {

    if (_config.toolsSide === "right") {
      Utils.addGlobalStatus("cloudnote__EDITOR-TOOLS-RIGHT");
    } else {
      Utils.addGlobalStatus("cloudnote__EDITOR-TOOLS-LEFT");
    }

    var tools = [];
    for (var i = 0, l = _config.tools.length; i < l; i++) {
      tools.push({
        name: _config.tools[i],
        disabled: ["undo", "redo", "save"].indexOf(_config.tools[i]) >= 0
      });
    }

    Main.loadTemplate("editorTools", {
      tools: tools
    }, moduleContainer, function (templateDom) {

      _container = templateDom;
      _container.addEventListener(Param.eventStart, _onTouchStart, true);
      if (_config.tools.indexOf("undo") >= 0) {
        _undoButton = _container.querySelector(".cloudnote-editor-tools__tool-undo");
      }
      if (_config.tools.indexOf("redo") >= 0) {
        _redoButton = _container.querySelector(".cloudnote-editor-tools__tool-redo");
      }
      if (_config.tools.indexOf("save") >= 0) {
        _saveButton = _container.querySelector(".cloudnote-editor-tools__tool-save");
      }
      (_toolsFunctions[_config.tools[0]])();

      Main.addRotationHandler(_onRotate);

    });

  }

  function init (params, moduleContainer) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Editor = app.Editor;
    Dashboard = app.Dashboard;
    _config = Utils.setConfig(params, _config);
    _initDom(moduleContainer);

  }

  app.module("Editor.Tools", {
    init: init,
    toggleButton: toggleButton
  });

})(cloudnote);
