/**
 * Created by truda on 14/05/2017.
 */
const $ = require('jquery');
const deepstream = require( 'deepstream.io-client-js' );

const PlayerSession = require('./session');

module.exports = class BaseGame {
    constructor(name) {
        this.name = name;

        this._id = "";
        this._ds = null;
        this._dsRecord = null;
        this._dsCallback = null;
        this._sessions = {};

        this._isPaused = false;
        this._isRunning = false;
        this._inputs = {
            direction: "stick",
            jump: "btn"
        }


    }

    getId() {
        return this._id;
    }

    isPaused() {
        return this._isPaused;
    }

    isRunning() {
        return this._isRunning;
    }

    onPlayerJoin(session) {}
    onPlayerQuit(session) {}

    onGameStart() {}
    onGamePause() {}
    onGameEnd() {}
    onGameTick() {}


    _init(deepstreamUrl, callback) {
        this._id = this._createGameId();

        this._initStream(deepstreamUrl, callback);
    }

    _playerJoin(session) {
        this._sessions[session.getId()] = session;
        this.onPlayerJoin(session);
    }

    _playerQuit(session) {
        session.close();

        delete this._sessions[session.getId()];
        this.onPlayerQuit(session);
    }

    _gameStart() {
        this.onGameStart();

        requestAnimationFrame(this._gameTick.bind( this ));
    }

    _gamePause() {
        this.onGamePause();
    }

    _gameEnd() {
        this.onGameEnd();
    }

    _gameTick(currentTime) {
        this.onGameTick(currentTime);

        requestAnimationFrame( this._gameTick.bind( this ) );
    }


    _initStream(deepstreamUrl, callback) {
        this._ds = deepstream( deepstreamUrl ).login( null, this._onStreamLoggedIn.bind(this) );
        this._dsCallback = callback;
    }

    _onStreamLoggedIn() {
        this._ds.record.getRecord("game/" + this._id + "").whenReady( this._onStreamRecordCreate.bind(this));
    }

    _onStreamRecordCreate(record) {
        this._dsRecord = record;
        this._updateStreamRecord();

        this._dsRecord.once('delete', this._onStreamRecordDelete.bind(this));
        this._ds.event.listen("game/" + this._id + "/players/.*", this._onStreamPlayerRecordUpdate.bind(this));

        if($.isFunction(this._dsCallback)) {
            this._dsCallback.call(this);
        }

        this._gameStart();
    }

    _onStreamRecordDelete() {
        this._gameEnd();
    }

    _onStreamPlayerRecordUpdate(match, isSubscribed) {
        let playerId = match.replace('game/' + this._id + "/players/", '');

        console.debug("SESSION", isSubscribed, match);

        if(playerId in this._sessions) {
            if(isSubscribed) {
                // Whut?
            }
            else {
                let session = this._sessions[playerId];
                this._playerQuit(session);
            }
        }
        else {
            if(isSubscribed) {
                let _this = this;
                this._ds.record.getRecord("player/" + playerId).whenReady(function(record) {
                    let session = new PlayerSession(playerId, record);
                    _this._playerJoin(session);
                });
            }
            else {
                // Whut?
            }
        }
    }

    _updateStreamRecord() {
        this._dsRecord.set({
            id: this._id,
            name: this.name,
            isPaused: this._isPaused,
            isRunning: this._isRunning,
            inputs: this._inputs
        })
    }


    _createGameId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for( var i=0; i < 4; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

};