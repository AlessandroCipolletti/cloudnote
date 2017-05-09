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

  var _config = {
    topnavHeight: 50.5
  };

  // TODO if ios >= 10.* ==> indexedDB
  // TODO if ios <= 9.*  ==> polyfill indexedDB

  var _dbName = "drawith_db", _dbVersion = 1.0, /* _drawingsStore = {}, */ _db = {}, _dbInitialized = false;
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

  function _updateDraw (draw, draft, aSync, callback) {
    // TODO eliminare vecchi file locali con cordova
    // TODO aggiungere nuovi file locali con cordova
    if (aSync) {
      _db.transaction(function (tx) {
        tx.executeSql(
          "UPDATE Drawings " +
          "SET state = ?, updateTimestamp = ?, localPathSmall = '', localPathBig = ?, minX = ?, minY = ?, maxX = ?, maxY = ?, width = ?, height = ? " +
          "WHERE id = ?",
          [(draft ? 1 : 2), new Date().getTime(), draw.base64, draw.minX, draw.minY, draw.maxX, draw.maxY, draw.w, draw.h, draw.localDbId],
          function (tx, result) {
            callback(draw.localDbId);
          }
        );
      });
    } else {
      new Promise (function (resolve, reject) {
        _db.transaction(function (tx) {
          tx.executeSql(
            "UPDATE Drawings " +
            "SET state = ?, updateTimestamp = ?, localPathSmall = '', localPathBig = ?, minX = ?, minY = ?, maxX = ?, maxY = ?, width = ?, height = ? " +
            "WHERE id = ?",
            [(draft ? 1 : 2), new Date().getTime(), draw.base64, draw.minX, draw.minY, draw.maxX, draw.maxY, draw.w, draw.h, draw.localDbId],
            function (tx, result) {
              resolve(draw.localDbId);
            }
          );
        });
      }).then(callback);
    }

  }

  function _addDraw (draw, draft, aSync, callback) {
    // TODO aggiungere nuovi file locali con cordova
    if (aSync) {
      _db.transaction(function (tx) {
        var now = new Date().getTime();
        tx.executeSql(
          "INSERT INTO Drawings (state, createTimestamp, updateTimestamp, localPathSmall, localPathBig, minX, minY, maxX, maxY, width, height, canvasWidth, canvasHeight) " +
          "VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [(draft ? 1 : 2), now, now, draw.base64, draw.minX, draw.minY, draw.maxX, draw.maxY, draw.w, draw.h, draw.canvasWidth, draw.canvasHeight],
          function (tx, result) {
            callback(result.insertId);
          }
        );
      });
    } else {
      new Promise (function (resolve, reject) {
        _db.transaction(function (tx) {
          var now = new Date().getTime();
          tx.executeSql(
            "INSERT INTO Drawings (state, createTimestamp, updateTimestamp, localPathSmall, localPathBig, minX, minY, maxX, maxY, width, height, canvasWidth, canvasHeight) " +
            "VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [(draft ? 1 : 2), now, now, draw.base64, draw.minX, draw.minY, draw.maxX, draw.maxY, draw.w, draw.h, draw.canvasWidth, draw.canvasHeight],
            function (tx, result) {
              resolve(result.insertId);
            }
          );
        });
      }).then(callback);
    }

  }

  function _removeDrawPromise (localDbId) {

    return new Promise (function (resolve, reject) {


      var trans = _db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");
      var request = store.delete(localDbId);
      request.onsuccess = function (e) {
        console.log("delete succesfull", e);
      };
      request.onerror = function (e) {
        console.log("delete error", e);
      };


      // _db.transaction(function (tx) {
      //   tx.executeSql("SELECT * FROM Drawings WHERE id = ?", [localDbId], function (tx, result) {
      //     // TODO delete local files
      //     tx.executeSql("DELETE FROM Drawings WHERE id = ?", [localDbId], function (tx, result) {
      //       resolve(true);
      //     });
      //   });
      // });


    });

  }

  function saveDraw (draw, callback) {

    if (draw.localDbId) {
      _updateDraw(draw, false, false, callback);
    } else {
      _addDraw(draw, false, false, callback);
    }

  }

  function saveDraft (draw, callback) {

    console.log("draft");
    if (draw.localDbId) {
      _updateDraw(draw, true, true, callback);
    } else {
      _addDraw(draw, true, true, callback);
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
    // TODO

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

    var tx = _db.transaction("Drawings", "readwrite");
    var store = tx.objectStore("Drawings");
    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);
    var results = [];
    cursorRequest.onsuccess = function (e) {
      var row = e.target.result;
      if (row) {
        results.push(row.value);
        row.continue();
      } else {
        if (force || results.length !== _currentLoadedDrawings.length) {
          _currentLoadedDrawings = results;
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

  function ___insertFooData (loadContent) {

    var trans = _db.transaction(["Drawings"], "readwrite");
    var store = trans.objectStore("Drawings");
    var data = {
      state: 2,
      createTimestamp: new Date().getTime(),
      updateTimestamp: new Date().getTime(),
      localPathSmall: "",
      localPathBig: "http://drawith.me/img/draw.png",
      minX: 100,
      minY: 100,
      maxX: 1180,
      maxY: 708,
      width: 1080,
      height: 608
    };
    var request = store.put(data);
    request.onsuccess = function (e) {
      console.log("insert ok", e);
      if (loadContent) {
        _loadContent();
      }
    };
    request.onerror = function (e) {
      console.log("insert error", e);
    };

  }

  function _initDb (loadContent) {

    var dbRequest = indexedDB.open(_dbName, _dbVersion);
    dbRequest.onsuccess = function (e) {  // db già esistente e della stessa versione
      console.log("indexDb: init - onsuccess");
      _db = e.target.result;
      _db.onerror = _onDbError;
      _dbInitialized = true;
      // ___insertFooData(loadContent);
      if (loadContent) {
        show(false, true);
      }
    };
    dbRequest.onupgradeneeded = function (e) {  // db nuovo o nuova versione
      console.log("IndexDb: init - onupgradeneeded");
      _db = e.target.result;
      _db.onerror = _onDbError;
      if (_dbVersion === 1.0) {
        _dbJustCreated = true;
      }
      var drawingsStore = _db.createObjectStore("Drawings", { keyPath: "id", autoIncrement: true });
      drawingsStore.createIndex("artistId", "artistId", { unique: false });
      drawingsStore.createIndex("folderId", "folderId", { unique: false });
      drawingsStore.transaction.oncomplete = function (e) {
        _dbInitialized = true;
        // ___insertFooData(loadContent);
        if (loadContent) {
          show(false, true);
        }
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
    // _initDb();
    _initDom();

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
