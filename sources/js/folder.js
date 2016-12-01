/*
  Documentations:
    openDatabase:
      https://goo.gl/CTDKiZ
      // fix db.changeVersion
      http://stackoverflow.com/questions/18052225/db-changeversion-doesnt-work-as-expected
    SQLite:
      http://sqlite.org/autoinc.html

*/

(function (app) {

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

  var _container = {}, _drawingsContainer = {}, _selectButton = {}, _doneButton = {}, _exportButton = {}, _deleteButton = {};
  var _dragged = false, _currentScroll = 0, _toolsMaxScroll = 0;
  var _db = {}, _dbJustCreated = false, _currentLoadedDrawings = -1;
  var _selectText = "Select", _doneText = "Done";

  function _show (spinner) {

    Utils.fadeInElements(_container);
    if (spinner) {
      Utils.setSpinner(false);
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
    // TODO eliminare vecchi file locali con conrdova
    // TODO aggiungere nuovi file locali con conrdova
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
    // TODO aggiungere nuovi file locali con conrdova
    if (aSync) {
      _db.transaction(function (tx) {
        var now = new Date().getTime();
        tx.executeSql(
          "INSERT INTO Drawings (state, createTimestamp, updateTimestamp, localPathSmall, localPathBig, minX, minY, maxX, maxY, width, height) " +
          "VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?)",
          [(draft ? 1 : 2), now, now, draw.base64, draw.minX, draw.minY, draw.maxX, draw.maxY, draw.w, draw.h],
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
            "INSERT INTO Drawings (state, createTimestamp, updateTimestamp, localPathSmall, localPathBig, minX, minY, maxX, maxY, width, height) " +
            "VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?)",
            [(draft ? 1 : 2), now, now, draw.base64, draw.minX, draw.minY, draw.maxX, draw.maxY, draw.w, draw.h],
            function (tx, result) {
              resolve(result.insertId);
            }
          );
        });
      }).then(callback);
    }

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
    Messages.info("To Do");

  }

  function _doneButtonClick () {

    if (_doneButton.classList.contains("disabled") || _doneButton.classList.contains("displayNone")) return;

  }

  function _exportButtonClick () {

    if (_exportButton.classList.contains("disabled")) return;

  }

  function _deleteButtonClick () {

    if (_deleteButton.classList.contains("disabled")) return;
    // aggiornare _currentLoadedDrawings
    // eliminare a db
    // eliminare dal dom pagina
    // eliminare immagini locali

  }

  function _rows2Array (rows) {

    var result = [];
    for (var i = 0; i < rows.length; i++) {
      result.push(rows.item(i));
    }
    for (i = result.length; i--; ) {
      result[i].draft = (result[i].state === 1);
    }
    return result;

  }

  function _loadContent (force, callback) {

    _db.transaction(function (tx) {
      tx.executeSql("SELECT * FROM Drawings ORDER BY updateTimestamp DESC", [], function (tx, result) {
        if (force || result.rows.length !== _currentLoadedDrawings.length) {
          _currentLoadedDrawings = _rows2Array(result.rows);
          _drawingsContainer.innerHTML = "";
          Main.loadTemplate("folderContent", {
            drawings: _currentLoadedDrawings
          }, _drawingsContainer, function (templateDom) {
            _drawingsContainer.scrollTop = 0;
            callback();
          });
        } else {
          callback();
        }
      });
    });

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
      hide();
      Editor.show(_currentLoadedDrawings[e.target.getAttribute("data-index")] || false);
    }

  }

  function _initDb () {

    _db = openDatabase("drawith_db", "1.0", "Drawith drawings local db", 4.90 * 1024 * 1024, function (db) {
      //callback only for first creation
      _dbJustCreated = true;
    });

    _db.transaction(function (tx) {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Drawings (" +
          "id INTEGER PRIMARY KEY, " +
          "title TEXT, " +
          "artistId INTEGER, " +
          "artistName TEXT, " +
          "state INTEGER, " +   // 1 = draft, 2 = saved, 3 = public
          "folderId INTEGER DEFAULT 0, " +    // todo in the future
          "createTimestamp DATETIME, " +
          "updateTimestamp DATETIME, " +
          "gpsCoordinates TEXT, " +
          "localPathSmall TEXT, " +
          "localPathBig TEXT, " +
          "minX INTEGER, " +
          "maxX INTEGER, " +
          "minY INTEGER, " +
          "maxY INTEGER, " +
          "width INTEGER, " +
          "height INTEGER, " +
          "mainColor TEXT, " +
          "dashboardX INTEGER, " +
          "dashboardY INTEGER" +
        ");",
        [],
        Utils.emptyFN
        // function (tx, result) { // TODO remove this
        //   console.log("create ok");
        //   // var now = new Date().getTime();
        //   // tx.executeSql(
        //   //   "INSERT INTO Drawings (state, createTimestamp, updateTimestamp, localPathSmall, localPathBig, minX, minY, maxX, maxY, width, height) " +
        //   //   "VALUES (2, ?, ?, '', 'http://drawith.me/img/draw.png', 100, 100, 1180, 708, 1080, 608)",
        //   //   [now, now], function (tx, result) {
        //   //     console.log("insert ok");
        //   //   }
        //   // );
        //   tx.executeSql("DELETE FROM Drawings", [], function (tx, result) {
        //     console.log("delete ok");
        //   });
        // }
      );
    });

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    Main.loadTemplate("folder", {
      selectText: _selectText,
      doneText: _doneText
    }, Param.container, function (templateDom) {

      _container = templateDom;
      _container.style.top = Param.headerSize + "px";
      _container.style.height = "calc(100% - " + Param.headerSize + "px)";
      _container.querySelector(".drawith-folder__topbar").style.height = _config.topnavHeight + "px";
      _selectButton = _container.querySelector(".drawith-folder__topbar-button-select");
      _doneButton = _container.querySelector(".drawith-folder__topbar-button-done");
      _exportButton = _container.querySelector(".drawith-folder__topbar-button-export");
      _deleteButton = _container.querySelector(".drawith-folder__topbar-button-delete");
      _container.querySelector(".drawith-folder__topbar").addEventListener(Param.eventStart, onTopnavTouchStart, true);
      _drawingsContainer = _container.querySelector(".drawith-folder__drawings-container");
      _drawingsContainer.style.height = "calc(100% - " + _config.topnavHeight + "px)";
      _drawingsContainer.style.top = _config.topnavHeight + "px";
      _drawingsContainer.addEventListener(Param.eventStart, _onTouchStart, true);
      _drawingsContainer.addEventListener(Param.eventEnd, _onTouchEnd, true);
      _toolsMaxScroll = _drawingsContainer.scrollHeight - _drawingsContainer.clientHeight;
      // Main.addRotationHandler(_onRotate);
      show(false, true);

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
    _initDb();
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
