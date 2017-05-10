/**
 * Created by truda on 09/05/2017.
 */
function toCamel(o) {
    var newO, origKey, newKey, value
    if (o instanceof Array) {
        newO = []
        for (origKey in o) {
            value = o[origKey]
            if (typeof value === "object") {
                value = toCamel(value)
            }
            newO.push(value)
        }
    } else {
        newO = {}
        for (origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString()
                value = o[origKey]
                if (value !== null && value !== undefined && value.constructor === Object) {
                    value = toCamel(value)
                }
                newO[newKey] = value
            }
        }
    }
    return newO
}

function toPascal(o) {
    var newO, origKey, newKey, value
    if (o instanceof Array) {
        newO = []
        for (origKey in o) {
            value = o[origKey]
            if (typeof value === "object") {
                value = toPascal(value)
            }
            newO.push(value)
        }
    } else {
        newO = {}
        for (origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                newKey = (origKey.charAt(0).toUpperCase() + origKey.slice(1) || origKey).toString()
                value = o[origKey]
                if (value !== null && value !== undefined && value.constructor === Object) {
                    value = toPascal(value)
                }
                newO[newKey] = value
            }
        }
    }
    return newO
}

function PikaEventDispatcher(parent) {
    var _this = this;
    _this.events = {};

    _this.addEventListener = function(name, handler) {
        if (_this.events.hasOwnProperty(name))
            _this.events[name].push(handler);
        else
            _this.events[name] = [handler];
    };

    _this.removeEventListener = function(name, handler) {
        /* This is a bit tricky, because how would you identify functions?
         This simple solution should work if you pass THE SAME handler. */
        if (!_this.events.hasOwnProperty(name))
            return;

        var index = _this.events[name].indexOf(handler);
        if (index !== -1)
            _this.events[name].splice(index, 1);
    };

    _this.fireEvent = function(name, args) {
        if (!_this.events.hasOwnProperty(name))
            return;

        if (!args || !args.length)
            args = [];

        var evs = _this.events[name], l = evs.length;
        for (var i = 0; i < l; i++) {
            evs[i].apply(null, args);
        }
    };

    parent.addEventListener = _this.addEventListener;
    parent.removeEventListener = _this.removeEventListener;
}

window.toCamel = toCamel;
window.toPascal = toPascal;
window.PikaEventDispatcher = PikaEventDispatcher;
/**
 * Created by truda on 09/05/2017.
 */
angular.module("PikaCore",[]);
/**
 * Created by truda on 09/05/2017.
 */

angular.module("PikaCore")
    .provider("$pikaLogger", PikaLoggerProvider)

;

function PikaLoggerProvider() {

    var config = {
        debug: true,
        info: true,
        warn: true,
        error: true
    };


    this.$get = [function() {
        return new PikaLoggerService(config);
    }];
}

function PikaLoggerService(config) {
    var _config = $.extend(true, {}, config);

    var _loggers = {};

    function createLogger(name) {
        if(_loggers.hasOwnProperty(name)) {
            return _loggers[name];
        }

        var logger = new PikaLogger(this, name);
        _loggers[name] = logger;

        return logger;
    }

    return createLogger;
}

function PikaLogger(loggerService, name) {
    var prefix = name.toString();

    this.debug = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(prefix);
        console.debug.apply(console, args);
    };

    this.info = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(prefix);
        console.log.apply(console, args);
    };

    this.warn = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(prefix);
        console.warn.apply(console, args);
    };

    this.error = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(prefix);
        console.error.apply(console, args);
    };
}