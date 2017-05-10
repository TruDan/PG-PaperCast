/**
 * Created by truda on 10/05/2017.
 */

const PIXI = require( 'pixi.js' );

module.exports = class State {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.stage = new PIXI.Container();
    }

    onInit() {}
    onActivate() {}
    onDeactivate() {}
    onUpdate() {}

    _init() {
        this.onInit();
    }

    _activate() {
        this.isActive = true;
        this.onActivate();
    }

    _deactivate() {
        this.isActive = false;
        this.onDeactivate();
    }

    _update(msSinceLastFrame, currentTime) {
        this.onUpdate();
    }

};