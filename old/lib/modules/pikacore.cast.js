/**
 * Created by truda on 09/05/2017.
 */
angular.module("PikaCore.Cast",[
    "PikaCore"
]);
/**
 * Created by truda on 08/05/2017.
 */
angular.module("PikaCore.Cast")
    .provider("$castConfig", CastConfigProvider)
;

function CastConfigProvider() {

    var config = {
        applicationId: '',
        namespaces: []
    };

    this.registerNamespace = function(namespace) {
        config.namespaces.push(namespace);
    };

    this.setApplicationId = function(applicationId) {
        config.applicationId = applicationId;
    };

    this.$get = [function() {
        return new CastConfigService(config);
    }];
}

function CastConfigService(config) {
    this.config = config;

    this.getApplicationId = function() {
        return config.applicationId;
    };

    this.getNamespaces = function() {
        return config.namespaces.slice(0);
    };
}