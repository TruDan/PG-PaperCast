/**
 * Created by truda on 09/05/2017.
 */
angular.module("PaperCast")
    .factory("paperCastGame", function($pikaGameSocket) {

        $pikaGameSocket.addEventListener("onOpen", function() {
            $pikaGameSocket.request("create");
        });

        $pikaGameSocket.connect();

        var service = {};

        return service;
    });