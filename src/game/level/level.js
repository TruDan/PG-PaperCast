/**
 * Created by truda on 10/05/2017.
 */
const Cell = require('./cell');
const PIXI = require('pixi.js');
const Viewport = require('./viewport');

var fill = require('flood-fill');
var zero = require('zeros');

const defaultOptions = {
    rows: 32,
    cols: 32,

    borderWidth: 10,
    cellSize: 32,
    cellLineColor: 0x909090
};

module.exports = class Level {
    constructor(game, options) {
        this._game = game;
        this.options = extend(defaultOptions, options);

        this.rows = this.options.rows;
        this.cols = this.options.cols;
        this.cellSize = this.options.cellSize;
        this.borderWidth = this.options.borderWidth;

        this.maxX = (this.cols * this.cellSize) + (2*this.borderWidth);
        this.maxY = (this.rows * this.cellSize) + (2*this.borderWidth);

        this.gridOffset = new PIXI.Point(this.borderWidth, this.borderWidth);

        this.tiles = new PIXI.Graphics();
        this._stage = new PIXI.Container();
        this._stagePlayers = new PIXI.Container();
        this._viewInternal = new PIXI.Container();

//        this._viewInternal.width = this.maxX;
//        this._viewInternal.height = this.maxY;

        this.options = null;
        this.cells = [];

        this.players = [];

        this.viewport = new Viewport(this._game);
        this.viewport.contentView.addChild(this._viewInternal);

        this.view = this.viewport.view;

        this.init();
    }

    init() {
        this._stage.addChild(this.tiles);
        this._viewInternal.addChild(this._stage);
        this._viewInternal.addChild(this._stagePlayers);
        this.tiles.clear();

        this.drawCells();
        this.drawGrid();
    };

    drawGrid() {
        this.tiles.clear();

        this.tiles.lineStyle(1, 0x777777, 0.2);

        for(let x=0; x<=this.cols; x++) {
            let lineX = this.gridOffset.x + (x * this.cellSize);
            this.tiles.moveTo(lineX, this.gridOffset.y);
            this.tiles.lineTo(lineX, this.maxY - this.gridOffset.y);
        }

        for(let y=0; y<=this.rows;y++) {
            let lineY = this.gridOffset.y + (y * this.cellSize);
            this.tiles.moveTo(this.gridOffset.x, lineY);
            this.tiles.lineTo(this.maxX-this.gridOffset.x, lineY);
        }

        // draw borders
        var hw = this.borderWidth/2;
        this.tiles.lineStyle(this.borderWidth, 0x000000, 0.8);
        this.tiles.moveTo(hw,hw);
        this.tiles.lineTo(hw,this.maxY-hw);
        this.tiles.lineTo(this.maxX-hw,this.maxY-hw);
        this.tiles.lineTo(this.maxX-hw,hw);
        this.tiles.lineTo(hw,hw);

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
        var cols = this.cols + 2;
        var rows = this.rows + 2;


        var grid = zero([cols, rows]); // +2 here so we can use the empty region outside!

        for(var x = 0; x < cols; x++) {
            for(var y = 0; y < rows; y++) {
                if(x === cols-1 || y === rows-1 || x === 0 || y === 0) {
                    grid.set(x,y,1);
                }
                else {
                    var cell = this.getCell(x-1, y-1);
                    if (cell.owner === null || cell.owner !== player) {
                        grid.set(x, y, 1);
                    }
                }
            }
        }

        fill(grid, 0, 0, 2);

        // Now inverse the fill, and this is the players claimed area.
        for(var x = 1; x < cols; x++) {
            for(var y = 1; y < rows; y++) {
                if(grid.get(x,y) !== 2) {
                    this.getCell(x-1,y-1).claim(player);
                }
            }
        }
    }

    revokeAllClaims(player) {
        for(var x = 0; x < this.cols; x++) {
            for(var y = 0; y < this.rows; y++) {
                var cell = this.getCell(x,y);
                if(cell.owner === player) {
                    cell.unclaim();
                }
            }
        }
        this.updateClaims(player);
    }

    hasClaim(player) {
        for(var x = 0; x < this.cols; x++) {
            for(var y = 0; y < this.rows; y++) {
                var cell = this.getCell(x,y);
                if(cell.owner === player) {
                    return true;
                }
            }
        }
        return false;
    }

    drawCells() {
        for(var x=0;x<this.cols;x++) {
            for(var y=0;y<this.rows;y++) {
                var cell = new Cell(this, x, y);
                this.cells[(x * this.rows) + y] = cell;
                cell._paint(this.tiles);
            }
        }
    }

    addPlayer(player) {
        var pos = this.getPointFromCell(Math.floor((this.cols-4) * Math.random()), Math.floor((this.rows-4) * Math.random()));

        this.players.push(player);
        this.viewport.addEntity(player.view);
        this.viewport.trackEntity(player);
        this._stagePlayers.addChild(player._trail._gfx, player.view);
        player.respawn(this, pos.x, pos.y);

        player._initDebug();
    }

    removePlayer(player) {
        for( var i = 0; i < this.players.length; i++ ) {
            if( this.players[i]._id === player._id ) {
                var p = this.players[i];
                p.kill();
                this.players.splice( i, 1 );
                this.viewport.removeEntity(player.view);
                this.viewport.untrackEntity(player);
                this._stagePlayers.removeChild(player._trail._gfx, player.view);
            }
        }
    }

    getCell(x, y) {
        return this.cells[(x * this.rows) + y];
    }

    getPointFromCell(x,y) {
        return new PIXI.Point(this.gridOffset.x + (x * this.cellSize), this.gridOffset.y + (y * this.cellSize));
    }

    getCellPosFromPoint(x, y) {
        return new PIXI.Point(Math.floor((x-this.gridOffset.x)/this.cellSize), Math.floor((y-this.gridOffset.y)/this.cellSize));
    }

    getCellPointFromPoint(x, y) {
        return new PIXI.Point(Math.floor((x-this.gridOffset.x)/this.cellSize)*this.cellSize+this.gridOffset.x, Math.floor((y-this.gridOffset.y)/this.cellSize)*this.cellSize+this.gridOffset.y);
    }

    containsPoint(x, y) {
        return(x >= this.gridOffset.x && y >= this.gridOffset.y && x <= this.gridOffset.x + ((this.cols-1) * this.cellSize) && y <= this.gridOffset.y + ((this.rows-1) * this.cellSize));
    }

    _update() {
        this.viewport._update();
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