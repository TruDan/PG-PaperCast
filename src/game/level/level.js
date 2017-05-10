/**
 * Created by truda on 10/05/2017.
 */
const Cell = require('./cell');
const PIXI = require('pixi.js');

var fill = require('flood-fill');
var zero = require('zeros');

const defaultOptions = {
    width: 32,
    height: 32,

    cellSize: 32,
    cellLineColor: 0x909090
};

module.exports = class Level {
    constructor(game, options) {
        this._game = game;
        this.options = extend(defaultOptions, options);

        this.height = this.options.height;
        this.width = this.options.width;
        this.cellSize = this.options.cellSize;

        this.maxX = this.width * this.cellSize;
        this.maxY = this.height * this.cellSize;

        this.tiles = new PIXI.Graphics();
        this._stage = new PIXI.Container();
        this._stagePlayers = new PIXI.Container();
        this.stage = new PIXI.Container();

        this.stage.width = this.maxX;
        this.stage.height = this.maxY;

        this.options = null;
        this.cells = [];

        this.players = [];

        this.init();
    }

    init() {
        this._stage.addChild(this.tiles);
        this.stage.addChild(this._stage);
        this.stage.addChild(this._stagePlayers);
        this.tiles.clear();

        this.drawCells();
        this.drawGrid();
    };

    drawGrid() {
        this.tiles.clear();

        this.tiles.lineStyle(1, 0x777777, 0.2);

        for(let x=0; x<=this.width; x++) {
            let lineX = x * this.cellSize;
            this.tiles.moveTo(lineX, 0);
            this.tiles.lineTo(lineX, this.maxY);
        }

        for(let y=0; y<=this.width;y++) {
            let lineY = y * this.cellSize;
            this.tiles.moveTo(0, lineY);
            this.tiles.lineTo(this.maxX, lineY);
        }

        // draw borders
        var borderThickness = 10;
        this.tiles.lineStyle(borderThickness, 0x000000, 0.8);
        this.tiles.moveTo(-borderThickness,-borderThickness);
        this.tiles.lineTo(-borderThickness,this.maxY+borderThickness);
        this.tiles.lineTo(this.maxX+borderThickness,this.maxY+borderThickness);
        this.tiles.lineTo(this.maxX+borderThickness,-borderThickness);
        this.tiles.lineTo(-borderThickness-borderThickness);

/*
        var textStyle = { fontSize: 12, fontFamily: 'monospace', fill: 'rgb(0,0,0)', align : 'center', trim: true };
        for(var x=0; x<this.width; x++) {
            for(var y=0; y<this.width;y++) {

                var text = new PIXI.Text( x + "," + y, textStyle );
                text.alpha = 0.2;
                text.position.x = x * this.cellSize + (0.5 * this.cellSize);
                text.position.y = y * this.cellSize + (0.5 * this.cellSize);
                text.anchor.x = 0.5;
                text.anchor.y = 0.5;

                //this._stage.addChild( text );
            }
        }
*/
    }

    updateClaims(player) {
        var grid = zero([this.width+1, this.height+1]); // +1 here so we can use the empty region outside!

        for(var x = 0; x < this.width+1; x++) {
            for(var y = 0; y < this.height+1; y++) {
                if(x >= this.width || y >= this.height) {
                    grid.set(x,y,1);
                }
                else {
                    var cell = this.getCellAt(x, y);
                    if (cell.owner === null || cell.owner !== player) {
                        grid.set(x, y, 1);
                    }
                }
            }
        }

        fill(grid, this.width, this.height, 2);

        // Now inverse the fill, and this is the players claimed area.
        for(var x = 0; x < this.width; x++) {
            for(var y = 0; y < this.height; y++) {
                if(grid.get(x,y) !== 2) {
                    this.getCellAt(x,y).claim(player);
                }
            }
        }
    }

    revokeAllClaims(player) {
        for(var x = 0; x < this.width; x++) {
            for(var y = 0; y < this.height; y++) {
                var cell = this.getCellAt(x,y);
                if(cell.owner === player) {
                    cell.unclaim();
                }
            }
        }
        this.updateClaims(player);
    }

    hasClaim(player) {
        for(var x = 0; x < this.width; x++) {
            for(var y = 0; y < this.height; y++) {
                var cell = this.getCellAt(x,y);
                if(cell.owner === player) {
                    return true;
                }
            }
        }
        return false;
    }

    drawCells() {
        for(var x=0;x<this.width;x++) {
            for(var y=0;y<this.height;y++) {
                var cell = new Cell(this, x,y,this.cellSize);
                this.cells.push(cell);
                cell._paint(this.tiles);
            }
        }
    }

    addPlayer(player) {
        var x = Math.floor(this.width * ( 0.1 + Math.random() * 0.8 ));
        var y = Math.floor(this.height * ( 0.1 + Math.random() * 0.8 ));

        this.players.push(player);
        player.respawn(this, x * this.cellSize, y * this.cellSize);

        player._initDebug();
    }

    removePlayer(player) {
        for( var i = 0; i < this.players.length; i++ ) {
            if( this.players[i]._id === player._id ) {
                var p = this.players[i];
                p.kill();
                this.players.splice( i, 1 );
            }
        }
    }

    getCellAt(x,y) {
        return this.cells[(x * this.height) + y];
    }

    getCellPoint(x,y) {
        return new PIXI.Point(Math.floor(x/this.cellSize), Math.floor(y/this.cellSize));
    }

    containsPoint(x, y) {
        return(x >= 0 && y >= 0 && x <= (this.width-1) * this.cellSize && y <= (this.height-1) * this.cellSize);
    }

    _update() {

    }
};

function extend (obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function (source) {
        if (source) {
            for (var prop in source) {
                if (typeof source[prop] !== "undefined" && source[prop].constructor === Object) {
                    if (typeof obj[prop] === "undefined" || obj[prop].constructor === Object) {
                        obj[prop] = obj[prop] || {};
                        this.extend(obj[prop], source[prop]);
                    } else {
                        obj[prop] = source[prop];
                    }
                } else {
                    obj[prop] = source[prop];
                }
            }
        }
    });
    return obj;
}