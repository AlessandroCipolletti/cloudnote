/*
  Documentations:
    openDatabase:
      https://goo.gl/CTDKiZ
      // fix db.changeVersion
      http://stackoverflow.com/questions/18052225/db-changeversion-doesnt-work-as-expected
    SQLite:
      http://sqlite.org/autoinc.html
    IndexedDB:
      https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
      https://www.codeproject.com/Articles/744986/How-to-do-some-magic-with-indexedDB

      // find one row by index value
      var index = objectStore.index("indexName");
      index.get("indexValue").onsuccess = function(e) {
        if (e.target.result) {
          alert("result id" + e.target.result.id);
          e.target.result.continue();
        }
      };

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Editor = {};
  var Messages = {};
  var MATH = Math;

  var _polyfills = [{
    name: "IndexDB",
    test: window.indexedDB,
    file: "indexeddb-shim3.js"
  }];
  var _config = {
    topnavHeight: 50.5
  };

  var _dbName = "drawith_db", _dbVersion = 2, /* _drawingsStore = {}, */ _db = {}, _dbInitialized = false;
  var _container = {}, _drawingsContainer = {}, _selectButton = {}, _doneButton = {}, _exportButton = {}, _deleteButton = {};
  var _toolsButtons = [];
  var _dragged = false, _currentScroll = 0, _toolsMaxScroll = 0, _modeSelection = false, _selectedDrawings = [];
  var _dbJustCreated = false, _currentLoadedDrawings = -1;
  var _labels = {
    select: "Select",
    done: "Done",
    deleteSomeDrawings: "Delete %P% drawings?",
    deleteOneDrawing: "Delete the drawing?"
  };

  function _show (spinner) {

    Utils.fadeInElements(_container);
    if (spinner) {
      Utils.setSpinner(false);
    }
    if (_currentLoadedDrawings.length === 0) {
      _selectButton.classList.add("disabled");
    } else {
      _selectButton.classList.remove("disabled");
    }

  }

  function show (spinner, forceReload) {

    Utils.addGlobalStatus("drawith__FOLDER-OPEN");
    _loadContent(forceReload, _show.bind({}, spinner));

  }

  function hide () {

    Utils.removeGlobalStatus("drawith__FOLDER-OPEN");
    Utils.fadeOutElements(_container);

  }

  function _updateDraw (draw, draft, callback) {

    var store = _db.transaction("Drawings", "readwrite").objectStore("Drawings");
    var request = store.get(draw.localDbId);
    request.onsuccess = function (e) {
      var row = event.target.result;
      row.state = (draft ? 1 : 2);
      row.draft = draft;
      row.updateTimestamp = new Date().getTime();
      row.blobSmall = draw.blobSmall;
      row.blobBig = draw.blobBig;
      row.minX = draw.minX;
      row.minY = draw.minY;
      row.maxX = draw.maxX;
      row.maxY = draw.maxY;
      row.width = draw.w;
      row.height = row.h;
      var requestUpdate = store.put(row);
      requestUpdate.onsuccess = function (e) {
        callback(draw.localDbId);
      };
    };

  }

  function _addDraw (draw, draft, callback) {

    var now = new Date().getTime();
    var request = _db.transaction("Drawings", "readwrite").objectStore("Drawings").put({
      state: (draft ? 1 : 2),
      draft: draft,
      createTimestamp: now,
      updateTimestamp: now,
      blobSmall: draw.blobSmall,
      blobBig: JSON.stringify(draw.blobBig),
      minX: draw.minX,
      minY: draw.minX,
      maxX: draw.minX,
      maxY: draw.minX,
      width: draw.w,
      height: draw.h,
      canvasWidth: draw.canvasWidth,
      canvasHeight: draw.canvasHeight
    });
    request.onsuccess = function (e) {
      callback(e.target.result);
    };

  }

  function _removeDrawPromise (localDbId) {

    return new Promise (function (resolve, reject) {
      var request = _db.transaction("Drawings", "readwrite").objectStore("Drawings").delete(localDbId);
      request.onsuccess = function (e) {
        resolve(true);
      };
    });

  }

  function saveDraw (draw, callback) {

    if (draw.localDbId) {
      _updateDraw(draw, false, callback);
    } else {
      _addDraw(draw, false, callback);
    }

  }

  function saveDraft (draw, callback) {

    if (draw.localDbId) {
      _updateDraw(draw, true, callback);
    } else {
      _addDraw(draw, true, callback);
    }

  }

  function deleteDraft (localDbId) {
    // TODO asincrono
  }

  function _selectButtonClick () {

    if (_selectButton.classList.contains("disabled") || _selectButton.classList.contains("displayNone")) return;
    _modeSelection = true;
    Utils.addGlobalStatus("drawith__FOLDER-SELECT-MODE");
    _selectButton.classList.add("disabled", "displayNone");
    _doneButton.classList.remove("disabled", "displayNone");

  }

  function _doneButtonClick () {

    if (_doneButton.classList.contains("disabled") || _doneButton.classList.contains("displayNone")) return;
    _modeSelection = false;
    Utils.removeGlobalStatus("drawith__FOLDER-SELECT-MODE");
    _doneButton.classList.add("disabled", "displayNone");
    _selectButton.classList.remove("disabled", "displayNone");
    _deselectAll();

  }

  function _exportButtonClick () {

    if (_exportButton.classList.contains("disabled")) return;
    console.log(_getSelectedIds());

  }

  function _deleteSelectedDrawingsCallback () {

    if (_currentLoadedDrawings.length === 0) {
      _doneButtonClick();
      _selectButton.classList.add("disabled");
    }

  }

  function _deleteSelectedDrawings () {

    var currentIds = _getSelectedIds();
    var promises = [];
    Utils.disableElements(_toolsButtons);
    for (var id in currentIds) {
      promises.push(_removeDrawPromise(currentIds[id]));
    }
    Promise.all(promises).then(_loadContent.bind({}, false, _deleteSelectedDrawingsCallback));

  }

  function _deleteButtonClick () {

    if (_deleteButton.classList.contains("disabled")) return;
    var ids = _getSelectedIds().length;
    var msg = ids === 1 ? _labels.deleteOneDrawing : _labels.deleteSomeDrawings.replace("%P%", ids);
    Messages.confirm(msg, true, _deleteSelectedDrawings);

  }

  function _getSelectedIds () {

    var selected = _drawingsContainer.querySelectorAll(".drawith-folder__drawing-selected");
    var result = [];
    for (var i = selected.length; i--; ) {
      result.push(parseInt(selected[i].getAttribute("data-id")));
    }
    return result;

  }

  function _deselectAll () {

    var selected = _drawingsContainer.querySelectorAll(".drawith-folder__drawing-selected");
    for (var i = selected.length; i--; ) {
      selected[i].classList.remove("drawith-folder__drawing-selected");
    }
    Utils.disableElements(_toolsButtons);

  }

  function _updateTopnavButtons () {

    if (_drawingsContainer.querySelectorAll(".drawith-folder__drawing-selected").length) {
      Utils.enableElements(_toolsButtons);
    } else {
      Utils.disableElements(_toolsButtons);
    }

  }

  function _revokeLocalBlobUrls (draws) {

    for (var i = draws.length; i--; ) {
      draws[i].localUrlSmall && URL.revokeObjectURL(draws[i].localUrlSmall);
      draws[i].localUrlBig   && URL.revokeObjectURL(draws[i].localUrlBig);
    }
  }

  function _mapDrawBlobToLocalUrl (draws) {

    _revokeLocalBlobUrls(draws);
    for (var i = draws.length; i--; ) {
      // draws[i].localUrlSmall = URL.createObjectURL(draws[i].blobSmall);
      if (draws[i].blobBig) {
        draws[i].localUrlBig = draws[i].localUrlSmall = URL.createObjectURL(draws[i].blobBig);
      } else {
        debugger;
      }

    }
    return draws;

  }

  function _renderContent (callback) {

    _drawingsContainer.innerHTML = "";
    Main.loadTemplate("folderContent", {
      drawings: _currentLoadedDrawings
    }, _drawingsContainer, function (templateDom) {
      _drawingsContainer.scrollTop = 0;
      callback();
    });

  }

  function _loadContent (force, callback) {

    // Get everything in the store;
    var cursorRequest = _db.transaction("Drawings", "readwrite").objectStore("Drawings").openCursor(IDBKeyRange.lowerBound(0), "prev");
    var results = [];
    cursorRequest.onsuccess = function (e) {
      var row = e.target.result;
      if (row) {
        results.push(row.value);
        row.continue();
      } else {
        if (force || results.length !== _currentLoadedDrawings.length) {
          _currentLoadedDrawings = _mapDrawBlobToLocalUrl(results);
          results = undefined;
          _renderContent(callback);
        } else {
          callback();
        }
      }
    };

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

    if (e.type.indexOf("mouse") >= 0 && e.button > 0 || _toolsMaxScroll === 0 || (e.touches && e.touches.length > 1)) {
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
    if (e.target.classList.contains("drawith-folder__drawing")) {
      if (_modeSelection) {
        if (!e.target.classList.contains("drawith-folder__drawing-new")) {
          e.target.classList.toggle("drawith-folder__drawing-selected");
          _updateTopnavButtons();
        }
      } else {
        hide();
        Editor.show(_currentLoadedDrawings[e.target.getAttribute("data-index")] || false);
      }
    }

  }

  function _onDbError (e) {
    console.log("Folder DB error: "+ JSON.stringify(e));
  }

  // function ___insertFooData (loadContent) {
  //
  //   var data = {
  //     state: 2,
  //     createTimestamp: new Date().getTime(),
  //     updateTimestamp: new Date().getTime(),
  //     localPathSmall: "",
  //     localPathBig: "http://drawith.me/img/draw.png",
  //     minX: 100,
  //     minY: 100,
  //     maxX: 1180,
  //     maxY: 708,
  //     width: 1080,
  //     height: 608
  //   };
  //   var request = _db.transaction("Drawings", "readwrite").objectStore("Drawings").put(data);
  //   request.onsuccess = function (e) {
  //     console.log("insert ok", e);
  //     if (loadContent) {
  //       _loadContent();
  //     }
  //   };
  //   request.onerror = function (e) {
  //     console.log("insert error", e);
  //   };
  //
  // }

  function _initDb (loadContent) {

    var dbRequest = indexedDB.open(_dbName, _dbVersion);
    function callback () {
      _dbInitialized = true;
      if (loadContent) {
        show(false, true);
      }
    }

    dbRequest.onsuccess = function (e) {  // db già esistente e della stessa versione
      console.log("indexDb: init - onsuccess");
      _db = e.target.result;
      _db.onerror = _onDbError;
      callback();
    };

    dbRequest.onupgradeneeded = function (e) {  // db nuovo o nuova versione
      console.log("IndexDb: init - onupgradeneeded");
      _db = e.target.result;
      _db.onerror = _onDbError;
      _dbInitialized = true;
      if (_dbVersion === 1.0) {
        _dbJustCreated = true;  // TODO verificare in qualche modo se il db è stato davvero creato per la prima volta, non importa a che versione
      }
      if (!_db.objectStoreNames.contains("Drawings")) {
        var drawingsStore = _db.createObjectStore("Drawings", { keyPath: "id", autoIncrement: true });
        drawingsStore.createIndex("artistId", "artistId", { unique: false });
        drawingsStore.createIndex("folderId", "folderId", { unique: false });
        drawingsStore.transaction.oncomplete = callback;
      } else {
        // elimino i vecchi disegni non salvati come blob
        var cursorRequest = e.target.transaction.objectStore("Drawings").openCursor(IDBKeyRange.lowerBound(0), "prev");
        cursorRequest.onsuccess = function (e) {
          var row = e.target.result;
          if (row) {
            if (row.localPathBig) {
              e.target.transaction.objectStore("Drawings").delete(row.id);
            }
            row.continue();
          }
          callback();
        };
      }
    };
    dbRequest.onfailure = dbRequest.onerror = _onDbError;

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    Main.loadTemplate("folder", {
      selectText: _labels.select,
      doneText: _labels.done
    }, Param.container, function (templateDom) {

      _container = templateDom;
      _container.style.top = Param.headerSize + "px";
      _container.style.height = "calc(100% - " + Param.headerSize + "px)";
      _container.querySelector(".drawith-folder__topbar").style.height = _config.topnavHeight + "px";
      _selectButton = _container.querySelector(".drawith-folder__topbar-button-select");
      _doneButton = _container.querySelector(".drawith-folder__topbar-button-done");
      _exportButton = _container.querySelector(".drawith-folder__topbar-button-export");
      _deleteButton = _container.querySelector(".drawith-folder__topbar-button-delete");
      _toolsButtons = [_exportButton, _deleteButton];
      _container.querySelector(".drawith-folder__topbar").addEventListener(Param.eventStart, onTopnavTouchStart, true);
      _drawingsContainer = _container.querySelector(".drawith-folder__drawings-container");
      _drawingsContainer.style.height = "calc(100% - " + _config.topnavHeight + "px)";
      _drawingsContainer.style.top = _config.topnavHeight + "px";
      _drawingsContainer.addEventListener(Param.eventStart, _onTouchStart, true);
      _drawingsContainer.addEventListener(Param.eventEnd, _onTouchEnd, true);
      _toolsMaxScroll = _drawingsContainer.scrollHeight - _drawingsContainer.clientHeight;
      // Main.addRotationHandler(_onRotate);
       _initDb(true);

    });

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Editor = app.Editor;
    Messages = app.Messages;
    _config = Utils.setConfig(params, _config);
    _config.topnavHeight *= Param.pixelRatio;
    Utils.initWithPolyfills(_polyfills, _initDom);

  }

  app.module("Folder", {
    init: init,
    show: show,
    hide: hide,
    saveDraw: saveDraw,
    saveDraft: saveDraft,
    deleteDraft: deleteDraft
  });

})(drawith);
