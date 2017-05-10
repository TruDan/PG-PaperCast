/**
 * Created by truda on 10/05/2017.
 */

const PIXI = require( 'pixi.js' );
const State = require('./state');
const Level = require('../level/level');

module.exports = class Game extends State {
    constructor(game) {
        super(game);

    }

    onInit() {
        //this.stage.backgroundColor = 0x000000;
        this.game.level.stage.pivot.set(0.5);
        this.stage.addChild(this.game.level.stage);

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
        this.stage.addChild(this.gameIdText);
    }

    onUpdate() {
        this.game.level._update();
    }

};