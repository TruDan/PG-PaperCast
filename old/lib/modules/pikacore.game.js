/**
 * Created by truda on 09/05/2017.
 */
angular.module("PikaCore.Game",[]);
/**
 * Created by truda on 28/04/2017.
 */
angular.module("PikaCore.Game")
    .provider("$pikaGameSocket", PikaGameSocketProvider)

;

function PikaGameSocketProvider() {

    var config = {
        connectOnStartup: false,
        autoReconnect: true,
        autoReconnectInterval: 5000,
        commandTimeout: 5000,
        server: {
            isSecure: window.location.protocol === 'https:',
            host: window.location.hostname,
            port: window.location.port,
            path: "/socket"
        }
    };

    this.connectOnStartup = function(val) {
        config.connectOnStartup = !!val;
    };

    this.autoReconnect = function(val) {
        config.autoReconnect = !!val;
    };

    this.setServerHost = function(host) {
        config.server.host = host;
    };

    this.setServerPort = function(port) {
        config.server.port = port;
    };

    this.setServerPath = function(path) {
        config.server.path = path;
    };


    this.$get = ["$q", "$pikaLogger", function($q, $pikaLogger) {
        return new PikaGameSocketService(config, $q, $pikaLogger('$pikaGameSocket'));
    }];
}

function PikaGameSocketService(config, $q, $pikaLogger) {
    var _this = this;
    var _config = $.extend(true, {}, config);

    var _socketPath = (_config.server.isSecure ? "wss" : "ws") + "://" + _config.server.host + ":" + _config.server.port + _config.server.path;
    var _eventDispatcher = new PikaEventDispatcher(_this);
    var _socket = null;

    function startSocket() {
        $pikaLogger.debug("Connecting to", _socketPath);
        _socket = new WebSocket(_socketPath);

        _socket.onopen = handleSocketOpen;
        _socket.onclose = handleSocketClose;
        _socket.onmessage = handleSocketMessage;
        _socket.onerror = handleSocketError;
    }

    function stopSocket() {
        _eventDispatcher.fireEvent("onStop");
        _socket.close();
    }

    function handleSocketOpen(e) {
        $pikaLogger.debug("Socket Opened");

        _eventDispatcher.fireEvent("onOpen");
    }

    function handleSocketClose(e) {
        $pikaLogger.debug("Socket Closed");

        _eventDispatcher.fireEvent("onClose");

        if(_config.autoReconnect && !(e.code === 1000 || e.code === 1001)) {
            $pikaLogger.debug("Socket Reconnect Queued");
            setTimeout(startSocket, 5000);
        }
    }

    function handleSocketMessage(e) {
        $pikaLogger.debug("RECV PREP", e.data);
        var pk = toCamel(JSON.parse(e.data));

        $pikaLogger.debug("RECV", pk);

        _eventDispatcher.fireEvent("onMessage", pk);
        _eventDispatcher.fireEvent("onMessage." + pk.request, pk);

        var reqId = pk.requestId;
        if(reqId > -1) {
            handleRequestResponse(pk);
        }
    }

    function handleSocketError(e) {
        $pikaLogger.error("ERROR", e);
    }

    function sendSocketMessage(pk) {
        $pikaLogger.debug("SEND PREP", pk);
        var msg = JSON.stringify(toPascal(pk));
        _socket.send(msg);
        $pikaLogger.debug("SEND", msg);
    }

    /* Message Request Handling */
    var _reqId = 0;
    var _queuedReqs = {};

    function requestSocketMessage(request, data) {
        var req = new SocketMessageRequest(_reqId++, request, data);

        req.send();

        setTimeout(req.timeout, _config.requestTimeout);

        return req.promise;
    }

    function handleRequestResponse(pk) {
        if(_queuedReqs.hasOwnProperty(pk.requestId)) {
            _queuedReqs[pk.requestId].handle(pk);
        }
    }

    function SocketMessageRequest(reqId, request, data) {
        var deferred = $q.defer();

        this.reqId = reqId;
        this.promise = deferred.promise;

        this.send = function() {
            _queuedReqs[reqId] = this;

            var pk = {requestId: reqId, request: request, data: data};
            sendSocketMessage(pk);
            deferred.notify(pk);
        };

        this.handle = function(response) {
            delete _queuedReqs[reqId];

            if(response.success)
                deferred.resolve(response.data);
            else
                deferred.reject(response.data);
        };

        this.timeout = function() {
            delete _queuedReqs[reqId];
            deferred.reject("Response Timeout");
        };
    }

    this.connect = startSocket;
    this.disconnect = stopSocket;
    this.request = requestSocketMessage;

    if(_config.connectOnStartup) {
        startSocket();
    }
}
/*
angular.module("MemeCastCore").factory("wdymSocket", function($rootScope) {

    var _socket = null;

    var _listeners = {};

    var _handles = {};
    var _commandCount = 0;

    var callEvent = function(request, message) {
        request = request.toLowerCase();

        if(_listeners[request]) {
            var handlers = _listeners[request];
            $.each(handlers, function(k,handler) {
                handler(message);
            });
        }
    };

    var wrapper = {};

    $rootScope.gameSocketConnected = false;

    wrapper.init = function() {
        _socket = new WebSocket((window.location.protocol === 'https:' ? "wss" : "ws") + "://" + window.location.hostname + ":" + window.location.port + "/socket");

        _socket.onclose = function() {
            console.log("Socket: Closed");
            wrapper.onClose();
            $rootScope.$apply(function() {
                $rootScope.gameSocketConnected = false;
                $rootScope.$emit('$gameSocketClosed');
            });

        };

        _socket.onopen = function() {
            console.log("Socket: Opened");
            wrapper.onOpen();
            $rootScope.$apply(function() {
                $rootScope.gameSocketConnected = true;
                $rootScope.$emit('$gameSocketOpened');
            });
        };

        _socket.onmessage = function(response) {
            var message = JSON.parse(response.data);
            console.log("Socket: RECV - ", message);

            var reqId = message.RequestId;
            if(reqId >= 0) {
                var handle = _handles[reqId];
                delete _handles[reqId];

                if (typeof(handle) == "function") {
                    $rootScope.$apply(function() {
                        handle(message);
                    });
                }
            }
            callEvent(message.Request, message);
        }
    };

    wrapper.send = function(command, data, callback) {
        var message = {
            Request: command,
            Data: data === undefined ? null : data
        };

        var reqId = -1;
        if (typeof (callback) == "function") {
            reqId = _commandCount++;
            _handles[reqId] = callback;
        }

        message.RequestId = reqId;

        var msg = JSON.stringify(message);
        _socket.send(msg);
        console.log("Socket: SEND ", msg);
    };

    wrapper.on = function(request, callback) {
        request = request.toLowerCase();

        if(!_listeners[request]) {
            _listeners[request] = [];
        }

        _listeners[request].push(callback);
    };

    wrapper.onOpen = function() {};
    wrapper.onClose = function() {};

   // wrapper.init();


    return wrapper;
});*/
/**
 * Created by truda on 09/05/2017.
 */
angular.module("PikaCore.Game")
    .provider("$pikaGame", PikaGameProvider)

;

function PikaGameProvider() {

    var config = {
        name: "",

    };


    this.$get = ["$pikaLogger", function($pikaLogger) {
        return new PikaGameService(config, $pikaLogger('$pikaGame'));
    }];
}

function PikaGameService(config, $pikaLogger) {



}