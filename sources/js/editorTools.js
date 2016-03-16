(function (app) {

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
      app.Editor.setTool({
        name: "marker",
        size: 15,
        forceFactor: 1.4,
        speedFactor: 0,
        shape: "circle",
        globalCompositeOperation: "source-over"
      });

    },
    pencil: function () {

      _selectTool("pencil");
      app.Editor.setTool({
        name: "pencil",
        size: 1,
        forceFactor: 4,
        speedFactor: 0,
        shape: "circle",
        globalCompositeOperation: "source-over"
      });

    },
    eraser: function () {

      _selectTool("eraser");
      app.Editor.setTool({
        name: "eraser",
        size: 20,
        forceFactor: 3,
        speedFactor: 0,
        shape: "circle",
        globalCompositeOperation: "destination-out"
      });

    },
    undo: function () {
      app.Editor.undo();
    },
    redo: function () {
      app.Editor.redo();
    },
    clear: function () {
      app.Editor.clear();
    },
    paper: function () {
      app.Editor.changePaper();
    },
    save: function () {
      app.Editor.save();
    },
    exit: function () {
      app.Editor.hide();
      app.Dashboard.show();
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

  function _getToolButton (tool, params) {

    var button = document.createElement("div");
    button.classList.add("cloudnote-editor-tools__tool");
    button.classList.add("cloudnote-editor-tools__tool-" + tool);
    if (params.selected) {
      button.classList.add("cloudnote-editor-tools__tool-selected");
    }
    if (params.disabled) {
      button.classList.add("disabled");
    }
    button.style.backgroundImage = "url('img/icons/" + tool + ".png')";
    button.setAttribute("data-tool", tool);
    return button;

  }

  function _initTools () {

    var tool, params = {};
    for (var i = 0, l = _config.tools.length; i < l; i++) {

      tool = _config.tools[i];
      params = {
        selected: i === 0,
        disabled: ["undo", "redo"].indexOf(tool) >= 0
      };
      _container.appendChild(_getToolButton(tool, params));
    }
    if (_config.tools.indexOf("undo") >= 0) {
      _undoButton = _container.querySelector(".cloudnote-editor-tools__tool-undo");
    }
    if (_config.tools.indexOf("redo") >= 0) {
      _redoButton = _container.querySelector(".cloudnote-editor-tools__tool-redo");
    }
    if (_config.tools.indexOf("save") >= 0) {
      _saveButton = _container.querySelector(".cloudnote-editor-tools__tool-save");
      toggleButton("save", false);
    }

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

  function _initDom () {

    if (_config.toolsSide === "right") {
      app.Utils.addGlobalStatus("cloudnote__EDITOR-TOOLS-RIGHT");
    } else {
      app.Utils.addGlobalStatus("cloudnote__EDITOR-TOOLS-LEFT");
    }
    _container = app.Utils.createDom("cloudnote-editor-tools__container");
    _container.addEventListener(app.Param.eventStart, _onTouchStart, true);
    app.Editor.addSubmoduleDom(_container);
    app.Main.addRotationHandler(_onRotate);

  }

  function init (params) {

    _config = app.Utils.setConfig(params, _config);
    _initDom();
    _initTools();
    (_toolsFunctions[_config.tools[0]])();

  }

  app.Editor.Tools = {
    init: init,
    toggleButton: toggleButton
  };

})(cloudnote);
