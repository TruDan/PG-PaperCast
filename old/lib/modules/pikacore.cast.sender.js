/**
 * Created by truda on 09/05/2017.
 */
angular.module("PikaCore.Cast.Sender",[
    "PikaCore.Cast",
    "PikaCore.UI",
    "PikaCore"
]);
/**
 * Created by truda on 01/05/2017.
 */
angular.module("PikaCore.Cast.Sender")
    .config(["$mdIconProvider", function($mdIconProvider) {
        $mdIconProvider.icon("cast-status","data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggaWQ9ImEiIGQ9Ik0xIDE4TDEgMjEgNCAyMUM0IDE5LjMgMi43IDE4IDEgMThMMSAxOFoiLz48cGF0aCBpZD0iYiIgZD0iTTEgMTRMMSAxNkMzLjggMTYgNiAxOC4yIDYgMjFMOCAyMUM4IDE3LjEgNC45IDE0IDEgMTRMMSAxNFoiLz48cGF0aCBpZD0iYyIgZD0iTTEgMTBMMSAxMkM2IDEyIDEwIDE2IDEwIDIxTDEyIDIxQzEyIDE0LjkgNy4xIDEwIDEgMTBMMSAxMFoiLz48cGF0aCBpZD0iZCIgZD0iTTIxIDNMMyAzQzEuOSAzIDEgMy45IDEgNUwxIDggMyA4IDMgNSAyMSA1IDIxIDE5IDE0IDE5IDE0IDIxIDIxIDIxQzIyLjEgMjEgMjMgMjAuMSAyMyAxOUwyMyA1QzIzIDMuOSAyMi4xIDMgMjEgM0wyMSAzWiIvPjxwYXRoIGlkPSJlIiBkPSJNNSA3TDUgOC42QzggOC42IDEzLjQgMTQgMTMuNCAxN0wxOSAxNyAxOSA3WiIvPjwvc3ZnPg==");
    }])
    .factory("castIconState", ["$castSender", function($castSender) {
        var state = {
            state: "",
            iconClass: ""
        };

        var eventListener = function(castSender, session, sessionState) {
            state.state = sessionState;
            switch (sessionState) {
                case cast.framework.SessionState.NO_SESSION:
                    state.iconClass = "cast-inactive";
                    break;
                case cast.framework.SessionState.SESSION_STARTING:
                    state.iconClass = "cast-connect";
                    break;
                case cast.framework.SessionState.SESSION_STARTED:
                    state.iconClass = "cast-active";
                    break;
                case cast.framework.SessionState.SESSION_START_FAILED:
                    state.iconClass = "cast-warn";
                    break;
                case cast.framework.SessionState.SESSION_ENDING:
                    state.iconClass = "cast-inactive";
                    break;
                case cast.framework.SessionState.SESSION_ENDED:
                    state.iconClass = "cast-inactive";
                    break;
                case cast.framework.SessionState.SESSION_RESUMED:
                    state.iconClass = "cast-active";
                    break;
            }
        };

        $castSender.onInit(function() {
            $castSender.registerListener(eventListener, true);
        });

        return state;
    }])
    .directive("castIcon", ["castIconState", function(castIconState) {
       return {
            restrict: 'A',
            priority: -1,
            link: function (scope, element, attr) {
                attr.$set("mdSvgIcon", 'cast-status');
//                element.attr('md-svg-icon','cast-status');

                element.addClass('cast-icon');
                if(attr.castIcon) {
                    element.addClass('cast-icon-' + attr.castIcon);
                }

                scope.$watch(function() { return castIconState.iconClass;}, function(newVal) {
                    element.removeClass('cast-inactive cast-warn cast-connect cast-active').addClass(newVal);
                });
            }
        };
    }]);