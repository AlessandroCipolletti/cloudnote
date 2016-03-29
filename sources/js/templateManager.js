(function (app) {

  // Dependencies
  var Utils = {};
  var Param = {};

  var _config = {
    cache: false
  };

  var _cache = {};

  function _loadFile (template) {

    if (typeof (cache[template]) === "undefined") {
      _cache[template] = Utils.promiseXHR("GET", template).then(function (xhr) {
        return Promise.resolve(_compile(xhr.responseText));
      });
    }

    return _cache[template];

  }

  function _load (template, params, container, callback) {

    template = Param.templatePath + template;

    var tplPromise = Promise.resolve(_loadFile(template));
      //.then(_parse.bind(this, template, params, container));

    if (container) {
      tplPromise.then(function (tpl) {
        container.appendChild(tpl);
        return tpl;
      });
    }

    if (callback) {
      tplPromise.then(callback);
    }

    return tplPromise;

  }





  function _loadTemplateFiles (templateName) {

    if (_config.cache === false || typeof (_cache[templateName]) === "undefined") {

      var files = {
        tpl: Utils.promiseXHR("GET", Param.templatePath + templateName + ".tpl"),
        css: Utils.promiseXHR("GET", Param.cssPath + templateName + ".css")
      };

      if (_config.cache) {
        _cache[templateName] = files;
      }

      return files;

    } else {
      return _cache[templateName];
    }

  }

  function _compile (file, params) {

    var template = Handlebars.compile(file);
    return template(params);

  }

  function load (templateName, params, container, callback) {

    // prima tappa: carico file js e css del template
    var templatePromise = Promise.resolve(_loadTemplateFiles(templateName))
    // seconda tappa: li compilo coi params
      .then(function (files) {
        debugger;
        files.html = _compile(files.tpl, params);
        files.tpl = undefined;
        delete files.tpl;
        return files;

      });

    // terza tappa: aggiungere al container
    if (container) {
      templatePromise.then(function (files) {
        debugger;
        container.appendChild(files.html);
        // ed aggiungere il css all'head
        var style = document.createElement('style');
        style.id = "css-" + templateName;
        style.type = 'text/css';
        style.textContent = files.css;
        document.head.appendChild(style);
        
        return files;

      });
    }

    // quarta tappa: chiamare la callback
    if (callback) {
      templatePromise.then(callback);
    }

    return templatePromise;

  }



  function init (params) {

    Utils = app.Utils;
    Param = app.Param;
    _config = Utils.setConfig(params, _config);

  }

  app.module("templateManager", {
    init: init,
    load: load
  });

})(cloudnote);
