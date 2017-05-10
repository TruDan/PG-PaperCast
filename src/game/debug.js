/**
 * Created by truda on 10/05/2017.
 */

const PIXI = require( 'pixi.js' );
const Game = require( './game' );
const keyboard = require('./input/input');

const Direction = {
    INVALID: -1,
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

module.exports = class Debug {
    constructor() {
        this.game = new Game(window.document.body);
        window.document.body.aGame = this.game;

        //this.player1 = this.game.addPlayer("dffgsdfgsdf");
        //this.player1.name = "Player1";
        //this.player2 = this.game.addPlayer("2");

        console.log(this);

        var _this = this;
        PIXI.keyboardManager.on('down', function (key) {
            switch (key) {
                case PIXI.keyboard.Key.W:
                    _this.player1.move(Direction.UP);
                    break;
                case PIXI.keyboard.Key.A:
                    _this.player1.move(Direction.LEFT);
                    break;
                case PIXI.keyboard.Key.S:
                    _this.player1.move(Direction.DOWN);
                    break;
                case PIXI.keyboard.Key.D:
                    _this.player1.move(Direction.RIGHT);
                    break;
                case PIXI.keyboard.Key.UP:
                    _this.player2.move(Direction.UP);
                    break;
                case PIXI.keyboard.Key.LEFT:
                    _this.player2.move(Direction.LEFT);
                    break;
                case PIXI.keyboard.Key.DOWN:
                    _this.player2.move(Direction.DOWN);
                    break;
                case PIXI.keyboard.Key.RIGHT:
                    _this.player2.move(Direction.RIGHT);
                    break;
            }
        });
    }
}