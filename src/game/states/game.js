/**
 * Created by truda on 10/05/2017.
 */

const PIXI = require( 'pixi.js' );
const State = require('./state');
const Level = require('../level/level');
const Viewport = require('../level/viewport');

module.exports = class Game extends State {
    constructor(game) {
        super(game);

    }

    onInit() {
        //this._viewInternal.backgroundColor = 0x000000;
        //this.game.level._viewInternal.pivot.set(0.5);
        //this._viewInternal.addChild(this.game.level._viewInternal);

        this.game.level.viewport.setPosition(100,100);
        this.game.level.viewport.setSize(this.game.renderer.width - 200, this.game.renderer.height - 200);
        this._viewInternal.addChild(this.game.level.view);

        this.gameIdText = new PIXI.Text("Game Code: " + this.game.id, {
            fontWeight: 'bold',
            fontSize: 45,
            fontFamily: 'Arial',
            fill: '#cc00ff',
            align: 'center',
            stroke: '#FFFFFF',
            strokeThickness: 6,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 0,
        });

        this.gameIdText.anchor.set(1,0);
        this.gameIdText.x = this.game.renderer.width-10;
        this.gameIdText.y = 10;
        this._viewInternal.addChild(this.gameIdText);
    }

    onUpdate() {
        this.game.level._update();
    }

};