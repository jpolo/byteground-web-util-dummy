define(["module", "require", "angular", "text"], function (module, require, angular) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};
  moduleConfig.debug = true;

  function debug(var_args) {
    if (moduleConfig.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  debug("config", moduleConfig);


  return angular
    .module(module.id, [ "ng" ])

    .config(["$provide", "$templateRequestRequireProvider", function ($provide, $templateRequestRequireProvider) {
      var replace = $templateRequestRequireProvider.config().replace;
      debug("$templateRequestRequire", replace ? "enabled" : "disabled");
      if (replace) {
        /*
        $provide.decorator("$templateRequest", ["$templateRequestRequire", function ($templateRequestRequire) {
          return $templateRequestRequire;//override
        }]);
        */
      }
    }])

  /**
   * Generic `require` provider
   */
    .provider("$require", [function () {

      this.$get = [function () {
        return require;
      }];

    }])

  /**
   * TemplateRequest service implemented with require
   */
    .provider("$templateRequestRequire", [function () {
      var settings = {
        debug: moduleConfig.debug,
        replace: true
      };

      this.config = function config(opt_val) {
        if (opt_val) {
          angular.extend(settings, opt_val);
        } else {
          return settings;
        }
      };

      this.$get = ["$q", "$require", "$sce", "$templateCache", function ($q, $require, $sce, $templateCache) {
        var isString = angular.isString;

        function $templateRequestRequire(url, ignoreRequestError) {
          debug("$templateRequestRequire(", url, ignoreRequestError, ")");

          return $q(function (resolve, reject) {
            $templateRequestRequire.totalPendingRequests += 1;

            if (!isString(url)) {
              url = $sce.getTrustedResourceUrl(url);
            }

            var templateContent = $templateCache.get(url);
            if (isString(templateContent)) {
              debug("$templateRequestRequire(", url, ignoreRequestError, ") -> OK (cache)");
              resolve(templateContent);
            } else {
              $require([ "text!" + url ],
                function (content) {
                  debug("$templateRequestRequire(", url, ignoreRequestError, ") -> OK");
                  $templateCache.put(url, content);
                  $templateRequestRequire.totalPendingRequests -= 1;
                  resolve(content);
                },
                function (error) {
                  $templateRequestRequire.totalPendingRequests -= 1;
                  debug("$templateRequestRequire(", url, ignoreRequestError, ") -> Error", error);
                  if (!ignoreRequestError) {
                    throw error;
                    /*throw $compileMinErr('tpload',
                     'Failed to load template: {0} (HTTP status: {1} {2})',
                     tpl, resp.status, resp.statusText);*/
                  }
                  reject(error);
                });
            }
          });
        }

        $templateRequestRequire.totalPendingRequests = 0;

        return $templateRequestRequire;
      }];

    }]);
});