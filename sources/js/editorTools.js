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

  var _toolsContainer = {}, _versionsContainer = {}, _pencilVersions = {}, _markerVersions = {};
  var _undoButton = false, _redoButton = false, _saveButton = false, _paperButton = false, _clearButton = false;
  var _papers = ["white", "squares", "lines"], _currentPaper = _papers[0], _versionsTimeout = false;
  var _toolsConfig = {
    pencil: {
      name: "pencil",
      size: 2,
      forceFactor: 0,
      speedFactor: 0,
      maxForce: 0.3,
      shape: "particlesRect",
      globalCompositeOperation: "source-over",
      cursor: false,
      versions: [{
        name : "2H",
        button: true,
        slider: false,
        params: {
          size: 2,
          shape: "particlesRect",
          maxForce: 0.3
        }
      }, {
        name: "HB",
        button: true,
        slider: false,
        params: {
          size: 2,
          shape: "particlesCircle",
          maxForce: 0.3
        }
      }, {
        name : "2B",
        button: true,
        slider: false,
        params: {
          size: 4,
          shape: "particlesCircle",
          maxForce: 0.3
        }
      }, {
        name : "XL",
        button: true,
        slider: false,
        params: {
          size: 9,
          shape: "particlesCircle",
          maxForce: 0.3
        }
      }]
    },
    marker: {
      name: "marker",
      size: 10,
      forceFactor: 1.5,
      speedFactor: 0,
      maxForce: 1,
      shape: "circle",
      globalCompositeOperation: "source-over",
      cursor: false,
      versions: [{
        name : "XS",
        button: true,
        slider: false,
        params: {
          size: 1,
          forceFactor: 3
        }
      }, {
        name : "S",
        button: true,
        slider: false,
        params: {
          size: 5,
          forceFactor: 2.5
        }
      }, {
        name : "M",
        button: true,
        slider: false,
        params: {
          size: 15,
          forceFactor: 2
        }
      }, {
        name : "L",
        button: true,
        slider: false,
        params: {
          size: 25,
          forceFactor: 1.5
        }
      }, {
        name : "XL",
        button: true,
        slider: false,
        params: {
          size: 40,
          forceFactor: 1.2
        }
      }
      /*{
        param: "size",
        button: false,
        slider: true,
        min: 1,
        max: 100,
        start: 10,
        decimals: 0
      }, {
        param: "alpha",
        button: false,
        slider: true,
        min: 0.1,
        max: 1,
        start: 1,
        decimals: 1
      }
      // TODO BLUR
      /*, {
        name : "blur",
        button: false,
        slider: true,
        //type: "slider",
        min: 1,
        max: 50,
        decimals: 0
      }
      */
      ]
    },
    eraser: {
      name: "eraser",
      size: 12,
      forceFactor: 3,
      speedFactor: 1,
      maxForce: 1,
      shape: "circle",
      globalCompositeOperation: "destination-out",
      cursor: true,
      versions: [
        /*{
        param: "size",
        button: false,
        slider: true,
        //type: "slider",
        min: 1,
        max: 100,
        start: 10,
        decimals: 0
      } */
      {
        name : "XS",
        button: true,
        slider: false,
        params: {
          size: 1
        }
      }, {
        name : "S",
        button: true,
        slider: false,
        params: {
          size: 5
        }
      }, {
        name : "M",
        button: true,
        slider: false,
        params: {
          size: 15
        }
      }, {
        name : "L",
        button: true,
        slider: false,
        params: {
          size: 25
        }
      }, {
        name : "XL",
        button: true,
        slider: false,
        params: {
          size: 40
        }
      }]
    },
    bucket: {
      name: "bucket",
      size: 1,
      forceFactor: 1,
      speedFactor: 1,
      maxForce: 1,
      shape: "",
      globalCompositeOperation: "source-over",
      cursor: false
    }
  };
  var _toolsFunctions = {
    marker: function (selected) {
      if (selected) {
        _toggleVersions("marker");
      } else {
        _selectTool("marker");
        Editor.setTool(_toolsConfig.marker);
      }
    },
    pencil: function (selected) {
      if (selected) {
        _toggleVersions("pencil");
      } else {
        _selectTool("pencil");
        Editor.setTool(_toolsConfig.pencil);
      }
    },
    eraser: function (selected) {
      if (selected) {
        _toggleVersions("eraser");
      } else {
        _selectTool("eraser");
        Editor.setTool(_toolsConfig.eraser);
      }
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

  function closeVersions () {

    var opened = _versionsContainer.querySelector(".drawith-editor-tools__versions-open");
    if (opened) {
      opened.classList.remove("drawith-editor-tools__versions-open");
      clearTimeout(_versionsTimeout);
      _versionsTimeout = false;
    }

  }

  function _toggleVersions (tool) {

    var versions = _versionsContainer.querySelector(".drawith-editor-tools__versions-" + tool);
    if (versions) {
      if (versions.classList.contains("drawith-editor-tools__versions-open")) {
        clearTimeout(_versionsTimeout);
        _versionsTimeout = false;
        versions.classList.remove("drawith-editor-tools__versions-open");
      } else {
        versions.classList.add("drawith-editor-tools__versions-open");
        clearTimeout(_versionsTimeout);
        _versionsTimeout = setTimeout(closeVersions, 4000);
      }
    }

  }

  function _selectTool (tool) {

    var selected = _toolsContainer.querySelector(".drawith-editor-tools__tool-selected");
    if (selected) {
      selected.classList.remove("drawith-editor-tools__tool-selected");
    }
    _toolsContainer.querySelector(".drawith-editor-tools__tool-" + tool).classList.add("drawith-editor-tools__tool-selected");
    closeVersions();
    _toggleVersions(tool);

  }

  function _toggleTool (tool) {
    return _toolsContainer.querySelector(".drawith-editor-tools__tool-" + tool).classList.toggle("drawith-editor-tools__tool-activated");
  }

  function _selectVersionButton (tool, version, notSave) {

    var params = _toolsConfig[tool].versions[version].params;
    for (var param in params) {
      _toolsConfig[tool][param] = params[param];
    }
    if (!notSave) {
      Editor.setTool(_toolsConfig[tool]);
    }

  }

  function _versionsTouchStart (tool, e) {

    e.preventDefault();
    e.stopPropagation();
    var container, target = e.target.nodeName === "P" ? e.target.parentNode : e.target;
    if (tool === "pencil") {
      container = _pencilVersions;
    } else if (tool === "marker") {
      container = _markerVersions;
    } else if (tool === "eraser") {
      container = _eraserVersions;
    }
    if (
      target.classList.contains("drawith-editor-tools__versions-button") &&
      !target.classList.contains("drawith-editor-tools__versions-button-selected")
    ) {
      container.querySelector(".drawith-editor-tools__versions-button-selected").classList.remove("drawith-editor-tools__versions-button-selected");
      target.classList.add("drawith-editor-tools__versions-button-selected");
      clearTimeout(_versionsTimeout);
      _versionsTimeout = setTimeout(closeVersions, 4000);
      _selectVersionButton(tool, target.getAttribute("data-versionsIndex"));
    }

  }

  function _onToolsTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    var target = e.target;
    if (
      target.classList.contains("drawith-editor-tools__tool") &&
      target.classList.contains("disabled") === false
    ) {

      var tool = target.getAttribute("data-tool");
      if (_toolsFunctions.hasOwnProperty(tool)) {
        (_toolsFunctions[tool])(target.classList.contains("drawith-editor-tools__tool-selected"));
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
        disabled: disabled.indexOf(_config.tools[i]) >= 0,
        versions: _toolsConfig[_config.tools[i]] ? _toolsConfig[_config.tools[i]].versions : false
      });
    }

    _setToolsSide();

    Main.loadTemplate("editorTools", {
      tools: tools
    }, moduleContainer, function (templateDom) {

      _toolsContainer = templateDom[0];
      _versionsContainer = templateDom[1];
      _pencilVersions = _versionsContainer.querySelector(".drawith-editor-tools__versions-pencil");
      _markerVersions = _versionsContainer.querySelector(".drawith-editor-tools__versions-marker");
      _eraserVersions = _versionsContainer.querySelector(".drawith-editor-tools__versions-eraser");

      if (_config.tools.indexOf("undo") >= 0) {
        _undoButton = _toolsContainer.querySelector(".drawith-editor-tools__tool-undo");
      }
      if (_config.tools.indexOf("redo") >= 0) {
        _redoButton = _toolsContainer.querySelector(".drawith-editor-tools__tool-redo");
      }
      if (_config.tools.indexOf("save") >= 0) {
        _saveButton = _toolsContainer.querySelector(".drawith-editor-tools__tool-save");
      }
      if (_config.tools.indexOf("clear") >= 0) {
        _clearButton = _toolsContainer.querySelector(".drawith-editor-tools__tool-clear");
      }
      if (_config.tools.indexOf("paper") >= 0) {
        _paperButton = _toolsContainer.querySelector(".drawith-editor-tools__tool-paper");
        _paperButton.classList.add("paper-squares");
      }
      (_toolsFunctions[_config.tools[0]])();
      _toolsContainer.addEventListener(Param.eventStart, _onToolsTouchStart, true);
      _pencilVersions.addEventListener(Param.eventStart, _versionsTouchStart.bind({}, "pencil"), true);
      _markerVersions.addEventListener(Param.eventStart, _versionsTouchStart.bind({}, "marker"), true);
      _eraserVersions.addEventListener(Param.eventStart, _versionsTouchStart.bind({}, "eraser"), true);

      _selectTool("marker");
      _selectVersionButton("marker", 1);
      _selectVersionButton("pencil", 0, true);
      _selectVersionButton("eraser", 1, true);
      //_pencilVersions.querySelector(".drawith-editor-tools__versions-button").classList.add("drawith-editor-tools__versions-button-selected");
      _pencilVersions.querySelector("[data-versionsIndex='0']").classList.add("drawith-editor-tools__versions-button-selected");
      _markerVersions.querySelector("[data-versionsIndex='1']").classList.add("drawith-editor-tools__versions-button-selected");
      _eraserVersions.querySelector("[data-versionsIndex='1']").classList.add("drawith-editor-tools__versions-button-selected");

      //Main.addRotationHandler(_onRotate);

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
    clickButton: clickButton,
    closeVersions: closeVersions
  });

})(drawith);
