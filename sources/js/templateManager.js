(function (app) {

  var _config = {

  };

  var _cache = {};

  var templateCore = {
    //Remove comments
    _comments: function (str) {
      return str.replace(/<\!\-\-[^>]*\-\-\>/gmi, '');
    },
    /**
     * Enable the {{exists}} tag.
     * {{exists variableName}}
     *   It exists
     * {{otherwise}}
     *   It does not exist
     * {{/exists}}
     */
    _exists: function (str) {

      return str
        .replace(/\{\{\s*exists\s*(.*?)\s*\}\}/g, function (matched, m1) {
          return '<% if ( typeof( ' + m1 + ') !== "undefined" ) {  %>';
        })
        .replace(/\{\{\s*otherwise\s*\}\}/g, function () {
          return '<% } else { %>';
        })
        .replace(/\{\{\s*\/exists\s*\}\}/g, '<% } %>');

    },
    /**
     * Enable the {{if}} tag.
     * {{if variableName}}
     *   If case
     * {{else}}
     *   Else case
     * {{/if}}
     */
    _if: function (str) {

      return str
        .replace(/\{\{\s*(else|if)(.*?)\s*\}\}/g, function (matched, m1, m2) {

          if (m1 === 'if') {
            return '<% if(' + m2 + ') { %>';
          } else if (m2 === '' && m1 === 'else') {
            return '<% } else { %>';
          } else if (m1 === 'else') {
            return '<% } else if(' + m2 + ') { %>';
          }

        })
        .replace(/\{\{\s*\/if\s*\}\}/g, '<% } %>');

    },
    /**
     * Enable the {{each}} tag.
     * @example
     * {{each(i,item) items}}
     *   {{item.value}}
     * {{/each}}
     */
    _each: function (str) {

      return str
        .replace(/\{\{\s*each\((.*?),(.*?)\)\s*(.*?)\s*\}\}/g, function (matched, m1, m2, m3) {
          return '<% for(var ' + m1 + ' in ' + m3 + ') { if(' + m3 + ' instanceof Array) {' + m1 +
            ' = parseInt(' + m1 + ', 10);} var ' + m2 + ' = ' + m3 + '[' + m1 + ']; %>';
        })
        .replace(/\{\{\s*\/each\s*\}\}/g, '<% } %>');

    },
    /**
     * Enable the simple display of a variable
     * the _var MUST be the last to be executed
     * {{variableName}}
     */
    _var: function (str) {
      str = str.replace(/(\r\n|\n|\r)/gm, " ");
      return str.replace(/\{\{(.*?)\}\}/g, '<%=$1%>').replace(/\s+/g, " ");
    }
  };

  function _parse () {

  }

  function _compile (str) {

    for (var i in _templateCore) {
      str = _templateCore[i](str);
    }

    // Generate a reusable function that will serve as a template
    // generator (and which will be cached).
    /*jslint evil: true */
    return new Function("obj",
      "var p=[];" +
      // Introduce the data as local variables using with(){}
      "with(obj){p.push('" +
      str.replace(/[\r\t\n]/g, " ")
      .replace(/'(?=[^%]*%>)/g, "\t")
      .split("'").join("\\'")
      .split("\t").join("'")
      .replace(/<%=(.+?)%>/g, "',$1,'")
      .split("<%").join("');")
      .split("%>").join("p.push('") + "');}return p.join('');");

  }

  function _loadFile (template) {

    if (typeof (cache[template]) === 'undefined') {
      _cache[template] = app.Utils.promiseXHR("GET", template).then(function (xhr) {
        return Promise.resolve(_compile(xhr.responseText));
      });
    }

    return _cache[template];

  }

  function load (template, params, container, callback) {

    template = param.templatePath + template;

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

  function init (params) {

    _config = app.Utils.setConfig(params, _config);

  }

  app.templateManager = {
    init: init,
    load: load
  };

})(cloudnote);
