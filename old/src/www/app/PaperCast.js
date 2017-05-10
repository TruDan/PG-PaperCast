/**
 * Created by truda on 09/05/2017.
 */
angular.module("PaperCast", [
    "PikaCore",
    "PikaCore.Game",
    "PikaCore.UI",
    "ui.router",
    "ct.ui.router.extras.previous",
])

    .config(function($pikaGameSocketProvider, $stateProvider) {

        $pikaGameSocketProvider.setServerPort(8080);

        $stateProvider
            .state("view", {
                url: "/view",
                templateUrl: "view.html",
                controller: "ViewController"
            });

    })

.controller("PaperCastRootController", function(paperCastGame, $state) {

    $state.go('view');
})
;