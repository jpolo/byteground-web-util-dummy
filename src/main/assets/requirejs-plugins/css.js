/**
 * RequireJS css! plugin
 *
 * Usage:
 *
 *  //json as text then parsed using JSON.parse
 *  require(['css!mymodule'], function (linkElement) { ... });
 *
 */
/*global: window, define */
define(['module'], function (module) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};

  var dom;
  (function (dom) {
    var global = window;
    var __doc = global.document;
    var __head = __doc.getElementsByTagName('head')[0] || __doc.documentElement;
    var UA = navigator.userAgent.toLowerCase();
    var
    isIE = false,
    isFF = false,
    isOP = false,
    isSafari = false,
    isChrome = false;

    if (UA.indexOf("firefox") >= 0) {
      isFF = true;
    } else if (UA.indexOf("opera") >= 0) {
      isOP = true;
    } else if (UA.indexOf("msie") >= 0) {
      isIE = true;
    } else if (UA.indexOf("chrom") >= 0) {
      isChrome = true;
    } else if (UA.indexOf("safari") >= 0) {
      isSafari = true;
    }

    var hasLinkOnLoad = isIE || isOP || isChrome || (!isSafari && 'onload' in create('link'));

    function create(n) {
      return __doc.createElement(n);
    }
    dom.create = create;

    function queryLinks() {
      return __doc.getElementsByTagName('link');
    }
    dom.queryLinks = queryLinks;

    function createLink(url, onload, onerror) {
      var link = create('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = onload;
      link.onerror = onerror;
      link.onreadystatechange = function () {
        var state = link.readyState;
        if (state === 'loaded' || state === 'complete') {
          link.onload.call(link);
        }
      };
      return link;
    }
    dom.createLink = createLink;

    function createImg(url, onload, onerror) {
      var img = create('img');
      img.onload = onload;
      img.onerror = onerror;
      img.src = url;
      return img;
    }
    dom.createImg = createImg;

    function insert(element, opt_parent) {
      (opt_parent || __head).appendChild(element);
    }
    dom.insert = insert;

    function remove(element) {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
    dom.remove = remove;


    var CSSLoader = (function (_super) {
      var supportWarn = _once(function () {
        _warn("<link/> does not support 'onload' event. Image loader enabled");
      });


      function CSSLoader() {
        var self = this, Ctor = CSSLoader;
        if (self instanceof CSSLoader) {
          _super.call(self);
        } else {
          return new Ctor();
        }
      }

      CSSLoader.prototype.load = function (url, opt_callback, opt_errback) {
        return _domLoadCSS(url, opt_callback, opt_errback);
      };

      CSSLoader.prototype.normalize = function normalize(name) {
        if (name.slice(-4) !== ".css") {
          name += ".css";
        }
        return name;
      };


      function _domLoadCSS(href, opt_callback, opt_errback) {
        var
        link, img,//hack loader
        onload = _once(function () {
          dom.remove(img);
          if (opt_callback) {
            opt_callback.call(link, null, true);
          }
        }),
        onerror = _once(function () {
          dom.remove(img);
          var error = new Error('Stylesheet failed to load');
          if (opt_errback) {
            opt_errback.call(link, error, null);
          } else {
            throw error;
          }
        }),
        timeout, interval;

        link = dom.createLink(href, onload, onerror);
        dom.insert(link);

        //image loader is a fallback
        if (!hasLinkOnLoad) {
          img = dom.createImg(href, onload, onerror);
          dom.insert(img);
          supportWarn();//warn once
        }
        return link;
      }

      function _warn(message) {
        if (typeof console !== "undefined") {
          console.warn(message);
        }
      }

      function _once(fn) {
        var done = false, result;
        return function () {
          if (!done) {
            done = true;
            result = fn.apply(this, arguments);
          }
          return result;
        };
      }

      return CSSLoader;
    }(Object));
    dom.CSSLoader = CSSLoader;

  }(dom || (dom = {})));



  var css;
  (function (css) {
    var loader = new dom.CSSLoader();
    var ATTR = 'data-requirecss';

    /**
     * @param {string} name
     * @param {function} normalizeFn
     * @return {string}
     */
    function normalize(name, normalizeFn) {
      return loader.normalize(name);
    }
    css.normalize = normalize;

    /**
     * @param {string} url
     * @param {function=} opt_callback
     * @param {function=} opt_errback
     */
    function get(url, opt_callback, opt_errback) {
      return loader.load(url, opt_callback, opt_errback);
    }
    css.get = get;

    /**
     * @param {string} name
     * @param {object} req
     * @param {function} onLoad
     * @param {object} config
     */
    function load(name, req, onLoad, config) {
      if (_isIncluded(name)) {
        onLoad();
      } else {
        var url = require.toUrl(normalize(name));
        var link = get(url, onLoad, onLoad.error);
        link.setAttribute(ATTR, name);
      }
    }
    css.load = load;

    function _isIncluded(name) {
      var links = dom.queryLinks();
      for (var i = 0, l = links.length; i < l; ++i) {
        if (links[i].getAttribute(ATTR) === name) {
          return true;
        }
      }
      return false;
    }

  }(css || (css = {})));

  return css;
});
