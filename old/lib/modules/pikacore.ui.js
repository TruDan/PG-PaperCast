/**
 * Created by truda on 09/05/2017.
 */
angular.module("PikaCore.UI",[
    "PikaCore",
    "ngMaterial"
])
    .config(["$mdThemingProvider", function($mdThemingProvider) {
        $mdThemingProvider.registerStyles("body {\n  background-color: \'{{background-900}}\'; }\n\nprofile.md-THEME_NAME-theme > profile-image {\n  background-color: \'{{background-800}}\';\n  border-color: \'{{primary-700}}\'; }\n\nprofile.md-THEME_NAME-theme .md-chips md-chip {\n  background-color: \'{{primary-600}}\';\n  color: \'{{background-200}}\'; }\n\nprofile-image.md-THEME_NAME-theme, .md-fab-profile.md-THEME_NAME-theme {\n  background-color: \'{{background-800}}\';\n  border-color: \'{{primary-700}}\'; }\n\nmd-list-item.md-warn .md-button, md-list-item.md-warn md-icon {\n  color: \'{{warn-color}}\'; }\n\nmd-toast.md-warn .md-toast-content {\n  color: \'{{warn-color}}\'; }\n  md-toast.md-warn .md-toast-content .md-subhead {\n    color: \'{{warn-hue-1}}\'; }\n\nmd-menu-content.md-THEME_NAME-theme.md-menu-bar-menu {\n  background-color: \'{{background-hue-1}}\'; }\n  md-menu-content.md-THEME_NAME-theme.md-menu-bar-menu md-menu-item.md-in-menu-bar {\n    color: \'{{foreground-2}}\'; }\n    md-menu-content.md-THEME_NAME-theme.md-menu-bar-menu md-menu-item.md-in-menu-bar md-icon {\n      color: \'{{foreground-3}}\'; }\n    md-menu-content.md-THEME_NAME-theme.md-menu-bar-menu md-menu-item.md-in-menu-bar .md-button[disabled] {\n      color: \'{{foreground-2}}\'; }\n      md-menu-content.md-THEME_NAME-theme.md-menu-bar-menu md-menu-item.md-in-menu-bar .md-button[disabled] md-icon {\n        color: \'{{foreground-3}}\'; }\n  md-menu-content.md-THEME_NAME-theme.md-menu-bar-menu md-menu-divider {\n    background-color: \'{{foreground-4}}\'; }\n\nmd-toolbar.md-THEME_NAME-theme.debug-bar.md-menu-toolbar {\n  background-color: \'{{background-hue-1}}\';\n  color: \'{{foreground-1}}\'; }\n  md-toolbar.md-THEME_NAME-theme.debug-bar.md-menu-toolbar md-toolbar-filler {\n    background-color: \'{{accent-color}}\';\n    color: \'{{background-A100-0.87}}\'; }\n    md-toolbar.md-THEME_NAME-theme.debug-bar.md-menu-toolbar md-toolbar-filler md-icon {\n      color: \'{{background-A100-0.87}}\'; }\n\nmd-menu-bar.md-THEME_NAME-theme > button.md-button, md-menu-bar.md-THEME_NAME-theme md-menu > button, debug-bar md-menu-bar.md-THEME_NAME-theme > button.md-button, debug-bar md-menu-bar.md-THEME_NAME-theme md-menu > button {\n  color: \'{{foreground-1}}\'; }\n\nmd-menu-bar.md-THEME_NAME-theme md-menu.md-open > button, md-menu-bar.md-THEME_NAME-theme md-menu > button:focus, debug-bar md-menu-bar.md-THEME_NAME-theme md-menu.md-open > button, debug-bar md-menu-bar.md-THEME_NAME-theme md-menu > button:focus {\n  outline: none;\n  background-color: \'{{background-hue-3-0.2}}\'; }\n\nmd-menu-bar.md-THEME_NAME-theme.md-open:not(.md-keyboard-mode) md-menu:hover > button, debug-bar md-menu-bar.md-THEME_NAME-theme.md-open:not(.md-keyboard-mode) md-menu:hover > button {\n  background-color: \'{{background-hue-3-0.2}}\'; }\n\n.cast-state-button.md-THEME_NAME-theme > span.cast-icon > svg {\n  fill: \'{{foreground-1-0.5}}\'; }\n\n.cast-state-button.md-THEME_NAME-theme.cast-state-not-connected > span.cast-icon {\n  opacity: 0.75; }\n\n.cast-state-button.md-THEME_NAME-theme.cast-state-connecting > span.cast-icon > svg {\n  fill: \'{{primary-hue-1-0.75}}\'; }\n\n.cast-state-button.md-THEME_NAME-theme.cast-state-connected > span.cast-icon > svg, .cast-state-button.md-THEME_NAME-theme.cast-state-connected > span.cast-icon > svg #boxfill {\n  fill: \'{{primary-color}}\'; }\n\n.cast-state-button.md-THEME_NAME-theme[disabled] > span.cast-icon {\n  opacity: 0.5 !important; }\n\n.cast-state-button.md-THEME_NAME-theme.md-raised > span.cast-icon > svg {\n  fill: \'{{background-900}}\'; }\n\nrange-slider.md-THEME_NAME-theme .range-slider-left md-slider .md-track {\n  background-color: \'{{accent-color}}\'; }\n  range-slider.md-THEME_NAME-theme .range-slider-left md-slider .md-track.md-track-fill {\n    background-color: \'{{background-hue-1}}\'; }\n\nrange-slider.md-THEME_NAME-theme .range-slider-left md-slider .md-thumb:after {\n  border-color: \'{{accent-color}}\';\n  background-color: \'{{accent-color}}\'; }\n\nrange-slider.md-THEME_NAME-theme .range-slider-right md-slider .md-track-container .md-track {\n  background-color: \'{{background-hue-1}}\'; }\n  range-slider.md-THEME_NAME-theme .range-slider-right md-slider .md-track-container .md-track.md-track-fill {\n    background-color: \'{{accent-color}}\'; }\n\nrange-slider.md-THEME_NAME-theme .range-slider-right md-slider .md-thumb:after {\n  border-color: \'{{accent-color}}\';\n  background-color: \'{{accent-color}}\'; }\n");
        $mdThemingProvider.theme('default')
            .primaryPalette('deep-purple')
            .accentPalette('light-blue')
            .backgroundPalette('grey')
            .warnPalette('pink')
            .dark();
    }]);
angular.module("PikaCore.UI").controller('RangeSliderController', ['$scope', function($scope){
    if(!$scope.step){
    $scope.step = 1;
}
if(!$scope.minGap){
    $scope.minGap = $scope.step;
}
$scope.$watchGroup(['min','max'],minMaxWatcher);
$scope.$watch('lowerValue',lowerValueWatcher);
$scope.$watch('upperValue',upperValueWatcher);

function minMaxWatcher() {
    $scope.lowerMax = $scope.max - $scope.step;
    $scope.upperMin = $scope.lowerValue + $scope.step;

    if(!$scope.lowerValue || $scope.lowerValue < $scope.min){
        $scope.lowerValue = $scope.min;
    }else{
        $scope.lowerValue*=1;
    }
    if(!$scope.upperValue || $scope.upperValue > $scope.max){
        $scope.upperValue = $scope.max;
    }else{
        $scope.upperValue*=1;
    }
    updateWidth();
}

function lowerValueWatcher() {
    if($scope.lowerValue >= $scope.upperValue - $scope.step){
        $scope.lowerValue = $scope.upperValue - $scope.step;
        return;
    }
    $scope.upperMin = $scope.lowerValue + $scope.step;

    updateWidth();
}

function upperValueWatcher() {
    if($scope.upperValue <= $scope.lowerValue + $scope.step){
        $scope.upperValue = $scope.lowerValue + $scope.step;
    }
}

function updateWidth() {
    $scope.upperWidth = ((($scope.max-($scope.lowerValue + $scope.step))/($scope.max-$scope.min)) * 100) + "%";
    if($scope.lowerValue > ($scope.upperValue - $scope.minGap) && $scope.upperValue < $scope.max) {
        $scope.upperValue = $scope.lowerValue + $scope.minGap;
    }
}
}])
    .directive('rangeSlider', ["$mdTheming", function ($mdTheming) {
    function templateFactory(elem,attr){
        var discrete = (attr.hasOwnProperty('mdDiscrete')) ? 'md-discrete={{mdDiscrete}}' :'';
        return [
            '<div class="range-slider-container">',
            '<div class="range-slider-left">',
            '<md-slider '+discrete+' aria-label="upperValue" step="{{step}}" ng-model="lowerValue" min="{{min}}" max="{{lowerMax}}"></md-slider>',
            '</div>',
            '<div class="range-slider-right" ng-style="{width: upperWidth}">',
            '<md-slider '+discrete+' aria-label="upperValue" step="{{step}}" ng-model="upperValue" min="{{upperMin}}" max="{{max}}"></md-slider>',
            '</div>',
            '</div>'
        ].join('');
    }

    return {

        restrict: 'E',
        scope: {
            max:'=',
            min:'=',
            minGap: '=?',
            step:'=?',
            mdDiscrete: "=?mdDiscrete",
            lowerValue: "=lowerValue",
            upperValue: "=upperValue"
        },
        template: templateFactory,
        controller: 'RangeSliderController',
        link: function(scope, element, attr) {
            element.addClass('_md');
            $mdTheming(scope, element);
        }
    };
}]);