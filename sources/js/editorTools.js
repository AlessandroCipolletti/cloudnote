(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Editor = {};
  var Dashboard = {};

  var _config = {
    tools: [],
    toolsSide: "left"
  };

  // TODO aggiungere doppio tap su tool, per scorrere verso sinistra la barra degli strumenti e poter scegliere la dimensione o altre cose
  // sub tools come oggetto figlio di ogni tool
  // se presente, trovare un modo automatico nell'interfaccia di permetterne la selezione
  // ogni elemento dei sub tool contiene chiave valore per i parametri del tool che modifica

  var _container = {};
  var _undoButton = false, _redoButton = false, _saveButton = false, _paperButton = false, _clearButton = false;
  var _papers = ["white", "squares", "lines"], _currentPaper = _papers[0];
  var _toolsConfig = {
    /*
    crayon: {
      name: "crayon",
      size: 9,
      forceFactor: 0,
      speedFactor: 0,
      shape: "particles",
      globalCompositeOperation: "source-over",
      cursor: false
    },
    */
    pencil: {
      name: "pencil",
      size: 2,
      forceFactor: 0,
      speedFactor: 0,
      //maxForce: 0.3, // TODO
      shape: "particlesRect",
      globalCompositeOperation: "source-over",
      cursor: false,
      versions: {
        "2h": {
          type: "button",
          icon: "",
          params: {
            size: 2,
            shape: "particlesRect",
            maxForce: 0.3
          }
        },
        "hb": {
          type: "button",
          icon: "",
          params: {
            size: 2,
            shape: "particlesCircle",
            maxForce: 0.3
          }
        },
        "2b": {
          type: "button",
          icon: "",
          params: {
            size: 4,
            shape: "particlesCircle",
            maxForce: 0.3
          }
        }
      }
    },
    maker: {
      name: "marker",
      size: 10,
      forceFactor: 1.5,
      speedFactor: 0,
      shape: "circle",
      globalCompositeOperation: "source-over",
      cursor: false,
      versions: {
        size: {
          type: "slider",
          min: 1,
          max: 100,
          start: 10
        },
        alpha: {
          type: "slider",
          min: 0.1,
          max: 1,
          start: 1
        },
        /*
        "xs": {
          type: "button",
          icon: "",
          params: {
            size: 1,
            forceFactor: 2.5
          }
        },
        "s": {
          type: "button",
          icon: "",
          params: {
            size: 5,
            forceFactor: 2
          }
        },
        "m": {
          type: "button",
          icon: "",
          params: {
            size: 10
          }
        },
        "l": {
          type: "button",
          icon: "",
          params: {
            size: 15,
            forceFactor: 1.3
          }
        },
        "xl": {
          type: "button",
          icon: "",

        }
        */
      }
    },
    /*
    pen: {
      name: "pen",
      size: 1,
      forceFactor: 2.5,
      speedFactor: 0,
      shape: "circle",
      globalCompositeOperation: "source-over",
      cursor: false
    },
    */
    eraser: {
      name: "eraser",
      size: 12,
      forceFactor: 2.5,
      speedFactor: 1,
      shape: "circle",
      globalCompositeOperation: "destination-out",
      cursor: true,
      versions: {
        "xs": {
          size: 6,
          icon: ""
        },
        "s": {
          size: 12,
          icon: ""
        },
        "m": {
          size: 24,
          icon: ""
        },
        "l": {
          size: 48,
          icon: ""
        }
      }
    },
    bucket: {
      name: "bucket",
      size: 1,
      forceFactor: 1,
      speedFactor: 1,
      shape: "",
      globalCompositeOperation: "source-over",
      cursor: false
    }
  };
  var _toolsFunctions = {
    marker: function () {
      _selectTool("marker");
      Editor.setTool(_toolsConfig.maker);
    },
    pen: function () {
      _selectTool("pen");
      Editor.setTool(_toolsConfig.pen);
    },
    crayon: function () {
      _selectTool("crayon");
      Editor.setTool(_toolsConfig.crayon);
    },
    pencil: function () {
      _selectTool("pencil");
      Editor.setTool(_toolsConfig.pencil);
    },
    eraser: function () {
      _selectTool("eraser");
      Editor.setTool(_toolsConfig.eraser);
    },
    bucket: function () {
      _selectTool("bucket");
      Editor.setTool(_toolsConfig.bucket);
    },
    rule: function () {
      (_toggleTool("rule") ? Editor.Rule.show() : Editor.Rule.hide());
    },
    undo: function () {
      Editor.undo();
    },
    redo: function () {
      Editor.redo();
    },
    coworkingStart: function () {
      Editor.startCoworking();
    },
    coworkingStop: function () {
      Editor.stopCoworking();
    },
    save: function () {
      Editor.save();
    },
    clear: function () {
      Editor.clear();
    },
    paper: function () {

      _currentPaper = _papers[(_papers.indexOf(_currentPaper) + 1) % _papers.length];
      _paperButton.classList.remove("paper-squares", "paper-lines", "paper-white");
      _paperButton.classList.add("paper-" + _papers[(_papers.indexOf(_currentPaper) + 1) % _papers.length]);
      Editor.changePaper(_currentPaper);

    },
    exit: function () {
      Editor.hide();
      Dashboard.show();
    }
  };

  function getToolConfig (tool) {
    return _toolsConfig[tool] || {};
  }

  function toggleButton (tool, enabled) {

    var button = false;
    if (_config.tools.indexOf(tool) >= 0) {

      if (tool === "undo") {
        button = _undoButton;
      } else if (tool === "redo") {
        button = _redoButton;
      } else if (tool === "save") {
        button = _saveButton;
      } else if (tool === "clear") {
        button = _clearButton;
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

  function clickButton (tool) {

    if (_config.tools.indexOf(tool) >= 0 && _toolsFunctions.hasOwnProperty(tool)) {
      (_toolsFunctions[tool])();
    }

  }

  function _selectTool (tool) {

    var selected = _container.querySelector(".drawith-editor-tools__tool-selected");
    if (selected) {
      selected.classList.remove("drawith-editor-tools__tool-selected");
    }
    _container.querySelector(".drawith-editor-tools__tool-" + tool).classList.add("drawith-editor-tools__tool-selected");

  }

  function _toggleTool (tool) {
    return _container.querySelector(".drawith-editor-tools__tool-" + tool).classList.toggle("drawith-editor-tools__tool-activated");
  }

  function _onTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    var target = e.target;
    if (
      target.classList.contains("drawith-editor-tools__tool") &&
      target.classList.contains("drawith-editor-tools__tool-selected") === false &&
      target.classList.contains("disabled") === false
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

  function _setToolsSide () {

    if (_config.toolsSide === "right") {
      Utils.removeGlobalStatus("drawith__EDITOR-TOOLS-LEFT");
      Utils.addGlobalStatus("drawith__EDITOR-TOOLS-RIGHT");
    } else {
      Utils.removeGlobalStatus("drawith__EDITOR-TOOLS-RIGHT");
      Utils.addGlobalStatus("drawith__EDITOR-TOOLS-LEFT");
    }

  }

  function _initDom (moduleContainer) {

    var tools = [];
    var disabled = ["undo", "redo", "save"];
    for (var i = 0, l = _config.tools.length; i < l; i++) {
      tools.push({
        name: _config.tools[i],
        disabled: disabled.indexOf(_config.tools[i]) >= 0
      });
    }

    _setToolsSide();

    Main.loadTemplate("editorTools", {
      tools: tools
    }, moduleContainer, function (templateDom) {

      _container = templateDom;
      _container.addEventListener(Param.eventStart, _onTouchStart, true);
      if (_config.tools.indexOf("undo") >= 0) {
        _undoButton = _container.querySelector(".drawith-editor-tools__tool-undo");
      }
      if (_config.tools.indexOf("redo") >= 0) {
        _redoButton = _container.querySelector(".drawith-editor-tools__tool-redo");
      }
      if (_config.tools.indexOf("save") >= 0) {
        _saveButton = _container.querySelector(".drawith-editor-tools__tool-save");
      }
      if (_config.tools.indexOf("clear") >= 0) {
        _clearButton = _container.querySelector(".drawith-editor-tools__tool-clear");
      }
      if (_config.tools.indexOf("paper") >= 0) {
        _paperButton = _container.querySelector(".drawith-editor-tools__tool-paper");
        _paperButton.classList.add("paper-squares");
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
    toggleButton: toggleButton,
    getToolConfig: getToolConfig,
    clickButton: clickButton
  });

})(drawith);
