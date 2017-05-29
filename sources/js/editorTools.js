/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Editor = {};
  var Dashboard = {};
  var MATH = Math;

  var _config = {
    tools: [],
    toolsSide: "left",
    versionsCloseDelay: 4000
  };

  // TODO sub tools di tipo slider

  var _toolsContainer = {}, _versionsContainer = {}, _markerVersions = {}, _pencilVersions = {}, _highlighterVersions = {}, _brushVersions = {}, _eraserVersions = {};
  var _undoButton = false, _redoButton = false, _saveButton = false, _paperButton = false, _clearButton = false;
  var _papers = ["white", "squares", "lines"], _currentPaper = _papers[0], _versionsTimeout = false, _currentScroll = 0, _toolsMaxScroll = 0;
  var _toolsConfig = {
    marker: {
      name: "marker",
      size: 10,
      sizeForceFactor: 1.5,
      sizeSpeedFactor: 0,
      alphaForceFactor: 1,
      alphaSpeedFactor: 0,
      degradeAlphaBySize: false,
      shape: "circle",
      image: false,
      rotation: false,
      globalCompositeOperation: "source-over",
      cursor: false,
      versions: [{
        name : "XS",
        button: true,
        slider: false,
        params: {
          size: 1,
          sizeForceFactor: 3
        }
      }, {
        name : "S",
        button: true,
        slider: false,
        params: {
          size: 5,
          sizeForceFactor: 2.5
        }
      }, {
        name : "M",
        button: true,
        slider: false,
        params: {
          size: 17,
          sizeForceFactor: 2
        }
      }, {
        name : "L",
        button: true,
        slider: false,
        params: {
          size: 30,
          sizeForceFactor: 1.5
        }
      }, {
        name : "XL",
        button: true,
        slider: false,
        params: {
          size: 60,
          sizeForceFactor: 0.9
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
    pencil: {
      name: "pencil",
      size: 2,
      sizeForceFactor: 0,
      sizeSpeedFactor: 0,
      alphaForceFactor: 0.5,
      alphaSpeedFactor: 0,
      degradeAlphaBySize: false,
      shape: "particlesRect",
      image: false,
      rotation: false,
      globalCompositeOperation: "source-over",
      cursor: false,
      versions: [{
        name : "2H",
        button: true,
        slider: false,
        params: {
          size: 2,
          shape: "particlesRect",
          alphaForceFactor: 0.4
        }
      }, {
        name: "HB",
        button: true,
        slider: false,
        params: {
          size: 2,
          shape: "particlesCircle",
          alphaForceFactor: 0.4
        }
      }, {
        name : "2B",
        button: true,
        slider: false,
        params: {
          size: 4,
          shape: "particlesCircle",
          alphaForceFactor: 0.4
        }
      }, {
        name : "XL",
        button: true,
        slider: false,
        params: {
          size: 9,
          shape: "particlesCircle",
          alphaForceFactor: 0.5
        }
      }]
    },
    highlighter: {
      name: "highlighter",
      size: 100,
      sizeForceFactor: 0,
      sizeSpeedFactor: 0,
      alphaForceFactor: 0.06,
      alphaSpeedFactor: 0,
      degradeAlphaBySize: false,
      shape: "image",
      image: false,
      rotation: false,
      globalCompositeOperation: "source-over",
      cursor: false,
      versions: [{
        name : "left",
        button: true,
        slider: false,
        params: {
          image: "highlighterLeft.png"
        }
      }, {
        name : "right",
        button: true,
        slider: false,
        params: {
          image: "highlighterRight.png"
        }
      }]
    },
    brush: {
      name: "brush",
      size: 100,
      sizeForceFactor: 0.3,
      sizeSpeedFactor: 0.2,
      alphaForceFactor: 0.06,
      alphaSpeedFactor: -0.05,
      degradeAlphaBySize: true,
      shape: "image",
      image: false,
      rotation: true,
      globalCompositeOperation: "source-over",
      cursor: false,
      versions: [{
        name: "1",
        button: true,
        slider: false,
        params: {
          image: "1.png"
        }
      }, {
        name: "2",
        button: true,
        slider: false,
        params: {
          image: "2.png"
        }
      }, {
        name: "3",
        button: true,
        slider: false,
        params: {
          image: "3.png"
        }
      }, {
        name: "4",
        button: true,
        slider: false,
        params: {
          image: "4.png"
        }
      }, {
        name: "5",
        button: true,
        slider: false,
        params: {
          image: "5.png"
        }
      }, {
        name: "6",
        button: true,
        slider: false,
        params: {
          image: "6.png"
        }
      }, {
        name: "7",
        button: true,
        slider: false,
        params: {
          image: "7.png"
        }
      }, {
        name: "8",
        button: true,
        slider: false,
        params: {
          image: "8.png"
        }
      }, {
        name: "9",
        button: true,
        slider: false,
        params: {
          image: "9.png"
        }
      }, {
        name: "10",
        button: true,
        slider: false,
        params: {
          image: "10.png"
        }
      }, {
        name: "11",
        button: true,
        slider: false,
        params: {
          image: "11.png"
        }
      }, {
        name: "12",
        button: true,
        slider: false,
        params: {
          image: "12.png"
        }
      }, {
        name: "13",
        button: true,
        slider: false,
        params: {
          image: "13.png"
        }
      }, {
        name: "14",
        button: true,
        slider: false,
        params: {
          image: "14.png"
        }
      }, {
        name: "15",
        button: true,
        slider: false,
        params: {
          image: "15.png"
        }
      }]
    },
    eraser: {
      name: "eraser",
      size: 12,
      sizeForceFactor: 3,
      sizeSpeedFactor: 0.5,
      alphaForceFactor: 1,
      alphaSpeedFactor: 0,
      degradeAlphaBySize: false,
      shape: "circle",
      image: false,
      rotation: false,
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
          size: 1,
          cursor: false
        }
      }, {
        name : "S",
        button: true,
        slider: false,
        params: {
          size: 7,
          cursor: true
        }
      }, {
        name : "M",
        button: true,
        slider: false,
        params: {
          size: 22,
          sizeForceFactor: 2,
          cursor: true
        }
      }, {
        name : "L",
        button: true,
        slider: false,
        params: {
          size: 40,
          sizeForceFactor: 1.75,
          cursor: true
        }
      }, {
        name : "XL",
        button: true,
        slider: false,
        params: {
          size: 75,
          sizeForceFactor: 2,
          cursor: true
        }
      }]
    },
    bucket: {
      name: "bucket",
      size: 1,
      sizeForceFactor: 0,
      sizeSpeedFactor: 0,
      alphaForceFactor: 0,
      alphaSpeedFactor: 0,
      degradeAlphaBySize: false,
      shape: "",
      image: false,
      rotation: false,
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
    highlighter: function (selected) {
      if (selected) {
        _toggleVersions("highlighter");
      } else {
        _selectTool("highlighter");
        Editor.setTool(_toolsConfig.highlighter);
      }
    },
    brush: function (selected) {
      if (selected) {
        _toggleVersions("brush");
      } else {
        _selectTool("brush");
        Editor.setTool(_toolsConfig.brush);
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
      Editor.exit();
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

    if (_versionsTimeout !== false) {
      _versionsContainer.querySelector(".drawith-editor-tools__versions-open").classList.remove("drawith-editor-tools__versions-open");
      clearTimeout(_versionsTimeout);
      _versionsTimeout = false;
    }

  }

  function selectInitialTools () {

    _selectTool("marker");
    _selectVersionButton("marker", 1);
    _selectVersionButton("pencil", 0, true);
    _selectVersionButton("highlighter", 0, true);
    _selectVersionButton("brush", 0, true);
    _selectVersionButton("eraser", 2, true);
    _toolsMaxScroll = _toolsContainer.scrollHeight - _toolsContainer.clientHeight;
    _toolsContainer.scrollTop = 0;
    var selectedVersion = false;
    for (var l = [_markerVersions, _pencilVersions, _highlighterVersions, _brushVersions, _eraserVersions], i = l.length; i--; ) {
      selectedVersion = l[i].querySelector(".drawith-editor-tools__versions-button-selected");
      if (selectedVersion) {
        selectedVersion.classList.remove("drawith-editor-tools__versions-button-selected");
      }
    }
    _markerVersions.querySelector("[data-versionsIndex='1']").classList.add("drawith-editor-tools__versions-button-selected");
    _pencilVersions.querySelector("[data-versionsIndex='0']").classList.add("drawith-editor-tools__versions-button-selected");
    _highlighterVersions.querySelector("[data-versionsIndex='0']").classList.add("drawith-editor-tools__versions-button-selected");
    _brushVersions.querySelector("[data-versionsIndex='0']").classList.add("drawith-editor-tools__versions-button-selected");
    _eraserVersions.querySelector("[data-versionsIndex='2']").classList.add("drawith-editor-tools__versions-button-selected");
    if (_toolsContainer.querySelector(".drawith-editor-tools__tool-rule").classList.contains("drawith-editor-tools__tool-activated")) {
      _toolsContainer.querySelector(".drawith-editor-tools__tool-rule").classList.remove("drawith-editor-tools__tool-activated");
      Editor.Rule.hide();
    }
    _currentPaper = _papers[0];
    _paperButton.classList.remove("paper-squares", "paper-lines", "paper-white");
    _paperButton.classList.add("paper-" + _papers[1]);
    Editor.changePaper(_currentPaper);

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
        _versionsTimeout = setTimeout(closeVersions, _config.versionsCloseDelay);
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

  function _onVersionsTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    var target = e.target.nodeName === "P" ? e.target.parentNode : e.target;
    if (
      target.classList.contains("drawith-editor-tools__versions-button") &&
      !target.classList.contains("drawith-editor-tools__versions-button-selected")
    ) {
      var tool = target.getAttribute("data-tool");
      this.querySelector(".drawith-editor-tools__versions-button-selected").classList.remove("drawith-editor-tools__versions-button-selected");
      target.classList.add("drawith-editor-tools__versions-button-selected");
      clearTimeout(_versionsTimeout);
      _versionsTimeout = setTimeout(closeVersions, _config.versionsCloseDelay);
      _selectVersionButton(tool, target.getAttribute("data-versionsIndex"));
    }

  }

  function _onToolsScrollTouchStart (e) {

    if (e.type.indexOf("mouse") >= 0 && e.button > 0 || _toolsMaxScroll === 0 || (e.touches && e.touches.length > 1)) {
      e.preventDefault();
      return;
    }
    if (this.scrollTop === 0) {
      _currentScroll = this.scrollTop = 1;
    } else if (this.scrollTop === _toolsMaxScroll) {
      _currentScroll = this.scrollTop = _toolsMaxScroll - 1;
    } else {
      _currentScroll = this.scrollTop;
    }

  }

  function _onToolsScrollTouchEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    if (MATH.abs(_currentScroll - this.scrollTop) > 10) {
      return;
    }
    _currentScroll = 0;
    var target = e.target;
    var tool = target.getAttribute("data-tool");
    if (target.classList.contains("drawith-editor-tools__tool") && !target.classList.contains("disabled")) {
      if (_toolsFunctions.hasOwnProperty(tool)) {
        (_toolsFunctions[tool])(target.classList.contains("drawith-editor-tools__tool-selected"));
      }
    } else if (
      target.classList.contains("drawith-editor-tools__versions-button") &&
      !target.classList.contains("drawith-editor-tools__versions-button-selected")
    ) {
      this.querySelector(".drawith-editor-tools__versions-button-selected").classList.remove("drawith-editor-tools__versions-button-selected");
      target.classList.add("drawith-editor-tools__versions-button-selected");
      clearTimeout(_versionsTimeout);
      _versionsTimeout = setTimeout(closeVersions, _config.versionsCloseDelay);
      _selectVersionButton(tool, target.getAttribute("data-versionsIndex"));
    }

  }

  function _onRotate (e) {
    _toolsMaxScroll = _toolsContainer.scrollHeight - _toolsContainer.clientHeight;
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

  function _initToolsImages () {

    var imgSrc, img;
    var onloadFn = function (tool, i) {
      _toolsConfig[tool].versions[i].params.image = this;
      var version = document.querySelector(".drawith-editor-tools__versions-" + tool + " [data-versionsIndex='" + i + "']");
      version.innerHTML = "";
      version.style.backgroundImage = "url('" + this.src + "')";
      this.onload = undefined;
    };
    for (var tool in _toolsConfig) {
      if (_toolsConfig[tool].shape === "image") {
        for (var i = _toolsConfig[tool].versions.length; i--; ) {
          imgSrc = "img/tools/" + _toolsConfig[tool].versions[i].params.image;
          if (typeof(imgSrc) === "string") {
            img = new Image();
            img.onload = onloadFn.bind(img, tool, i);
            img.src = imgSrc;
          }
        }
      }
    }

  }

  function _initDom (moduleContainer) {

    var tools = [];
    var disabled = ["undo", "redo"];  // "save"
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
      _highlighterVersions = _versionsContainer.querySelector(".drawith-editor-tools__versions-highlighter");
      _markerVersions = _versionsContainer.querySelector(".drawith-editor-tools__versions-marker");
      _brushVersions = _versionsContainer.querySelector(".drawith-editor-tools__versions-brush");
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
      _toolsContainer.addEventListener(Param.eventStart, _onToolsScrollTouchStart.bind(_toolsContainer), true);
      _toolsContainer.addEventListener(Param.eventEnd, _onToolsScrollTouchEnd.bind(_toolsContainer), true);
      _pencilVersions.addEventListener(Param.eventStart, _onVersionsTouchStart.bind(_pencilVersions), true);
      _highlighterVersions.addEventListener(Param.eventStart, _onVersionsTouchStart.bind(_highlighterVersions), true);
      _markerVersions.addEventListener(Param.eventStart, _onVersionsTouchStart.bind(_markerVersions), true);
      _brushVersions.addEventListener(Param.eventStart, _onToolsScrollTouchStart.bind(_brushVersions), true);
      _brushVersions.addEventListener(Param.eventEnd, _onToolsScrollTouchEnd.bind(_brushVersions), true);
      _eraserVersions.addEventListener(Param.eventStart, _onVersionsTouchStart.bind(_eraserVersions), true);
      selectInitialTools();
      _initToolsImages();
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
    clickButton: clickButton,
    closeVersions: closeVersions,
    selectInitialTools: selectInitialTools
  });

})(drawith);
