define(["module", "angular"], function (module, angular) {
  "use strict";

  console.warn("[" + module.id + "] is deprecated use <md-icon> instead");

  return angular
    .module(module.id, [])

    /**
     * Usage:
     *   <i ng-social-icon="facebook"></i>
     */
    .directive("ngSocialIcon", function () {

      return {
        restrict: "EA",
        link: function ($scope, $element, $attrs) {
          var nosquare = {
            instagram: true
          };

          function formatClass(type) {
            var s = "";
            if (type) {
              s += "fa-";
              s += type;
              if (!nosquare[type]) {
                s += '-square';
              }
            }
            return s;
          }

          $scope.$watch(
            function () {
              return $attrs.ngSocialIcon;
            },
            function (iconType, iconTypeOld) {
              $element
                .addClass('fa fa-fw')
                .removeClass(formatClass(iconTypeOld))
                .addClass(formatClass(iconType));
            });
        }
      };
    });
});