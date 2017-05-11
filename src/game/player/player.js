/**
 * Created by truda on 09/05/2017.
 */
const PIXI = require( 'pixi.js' );
const Trail = require('./trail');
//const keyboard = require('pixi-keyboard');
const $ = require('jquery');

const Direction = {
    INVALID: -1,
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

const TINTS = [
    0x00FF00,
    0x66FFAA,
    0x00FFFF,
    0xFF00FF,
    0xFFAAFF,
    0x00FF33,
    0x99FF44,
    0xFFFF00,
    0xFF6600
];

const SPEED = 4;

module.exports = class Player {
    constructor(game, id, dsUser=false) {
        this._id = id;
        this._game = game;
        this._dsUser = dsUser;

        if(this._dsUser)
            this._record = global.ds.record.getRecord( 'player/' + this._id );

        // public properties
        this.name = "";
        this.tint = this._getTint();
        this.level = null;

        this.width = 32;
        this.height = 32;

        this.x = 0;
        this.y = 0;

        this.isAlive = false;
        this._isMoving = false;
        this._direction = Direction.NONE;
        this._nextDirection = Direction.NONE;

        this._trail = new Trail(this);

        this._initGraphics();

        this.reset();
    }

    respawn(level, x, y) {
        this.level = level;

        this.x = x;
        this.y = y;

        this._updateGraphics();
        this.reset();

        // Claim a 3x3
        var cellPos = this.getCurrentCell();
        for(var i=-1;i<=1;i++) {
            for(var j=-1;j<=1;j++) {
                this._claimCell(cellPos.x + i, cellPos.y + j);
            }
        }

        this.isAlive = true;
    }

    move(direction) {
        if(this._direction === direction) {
            // Ignore, they're going that way anyway.
            return;
        }

        // Target direction is different to before, let's queue it.
        this._nextDirection = direction;
        this._isMoving = true;
    }

    reset() {
        this.isAlive = false;
        this.view.alpha = 1;
        this._trail.reset();
    }

    kill() {
        this.isAlive = false;
        this.view.alpha = 0;

        this._isMoving = false;
        this._direction = Direction.NONE;
        this._trail.reset();

        this.level.revokeAllClaims(this);

        console.log("Killed Player ", this._id, this.name);
        this.remove();
    }

    remove() {
        if(this._record !== undefined)
            this._record.delete();
        this._game._removeDebugInfo(this._debugPos);
    }

    getCurrentCell() {
        return this.level.getCellPosFromPoint(this.x, this.y);
    }

    isCollidingWith(player) {
        if(!this.isAlive || !player.isAlive) return false;

        return (player._trail.containsPoint(this.x, this.y));
    }

    _canMove(targetX, targetY) {
        if(!this.isAlive) return;
        return (this.level.containsPoint(targetX, targetY));
    }

    _updateMove() {
        if(!this.isAlive || !this._isMoving) return;

        // Only change their direction when fully in a grid cell
        let cellSize = this.level.cellSize;
        if((this.x - this.level.gridOffset.x) % cellSize === 0 && (this.y - this.level.gridOffset.y) % cellSize === 0) {
            this._direction = this._nextDirection;
        }

        if(this._direction === Direction.NONE || this._direction === Direction.INVALID)
            return;

        let movePoint = this._getDirectionPoint(this._direction);
        let targetX = this.x + (movePoint.x * SPEED);
        let targetY = this.y + (movePoint.y * SPEED);

        // normalise to cell pos
        var cellPos = this.getCurrentCell();

        if((this.y - this.level.gridOffset.y) % cellSize !== 0) {
            if (this._direction === Direction.UP) {
                targetY = Math.max(targetY, this.level.gridOffset.y + (cellPos.y) * this.level.cellSize);
            }
            else if (this._direction === Direction.DOWN) {
                targetY = Math.min(targetY, this.level.gridOffset.y + (cellPos.y + 1) * this.level.cellSize);
            }
        }

        if((this.x - this.level.gridOffset.x) % cellSize !== 0) {
            if (this._direction === Direction.LEFT) {
                targetX = Math.max(targetX, this.level.gridOffset.x + (cellPos.x) * this.level.cellSize);
            }
            else if (this._direction === Direction.DOWN) {
                targetX = Math.min(targetX, this.level.gridOffset.x + (cellPos.x + 1) * this.level.cellSize);
            }
        }

        if(this._canMove(targetX, targetY)) {
            if((this.x - this.level.gridOffset.x) % cellSize === 0 && (this.y - this.level.gridOffset.y) % cellSize === 0) {
                this._checkClaimedCells();
            }

            this.x = Math.floor(targetX);
            this.y = Math.floor(targetY);
            //this._game._viewInternal.target.x = this.x;
            //this._game._viewInternal.target.y = this.y;
            this._trail.addPoint(this.x, this.y);
        }
        else {
            // snap to nearest grid tile
            var cp = this.level.getCellPointFromPoint(this.x, this.y);
            this.x = cp.x;
            this.y = cp.y;
            this._direction = Direction.NONE;
        }
    }

    _claimCell(x,y) {
        //console.log("Player " + this.name + " is claiming " + x + "," + y);
        var cell = this.level.getCell(x,y);
        cell.claim(this);
        cell._paint(this.level.tiles);
    }

    _checkClaimedCells() {
        var cellPos = this.getCurrentCell();
        var cell = this.level.getCell(cellPos.x, cellPos.y);
        if(cell.owner === this) {
            // Claim all cells in this path and reset path.
            var points = [...this._trail.points];
            for(var i=0; i<points.length;i++) {
                var p = points[i];
                this._claimCell(p.x, p.y);
            }
            this.level.updateClaims(this);

            this._trail.reset();
        }
    }

    _checkClaimConditions() {
        if(!this.isAlive) return;

        if(!this.level.hasClaim(this)) {
            this._game.removePlayer(this._id);
        }
    }

    _getDirectionPoint(direction) {
        let x = 0, y = 0;
        if(direction === Direction.UP) {
            y = - 1;
        }
        else if(direction === Direction.DOWN) {
            y = 1;
        }
        else if(direction === Direction.LEFT) {
            x = - 1;
        }
        else if(direction === Direction.RIGHT) {
            x = 1;
        }
        return new PIXI.Point(x,y);
    }

    _checkCollision() {
        if(!this.isAlive) return;

        for(let i=0; i<this.level.players.length;i++) {
            var player = this.level.players[i];
            //if(player === this) continue;

            if(this.isCollidingWith(player)) {
                this._game.removePlayer(this._id);
            }
        }
    }

    _getTint() {
        return TINTS[ Math.floor(Math.random() * TINTS.length) % TINTS.length];
        var sum = 0, i;

        for( i = 0; i < this.name.length; i++ ) {
            sum += this.name.charCodeAt( i );
        }

        return TINTS[ sum % TINTS.length ];
    }

    _initDebug() {
        this._debugPos = new PIXI.Text("");
        this._game._addDebugInfo(this._debugPos);
    }

    _updateDebug() {
        var cellPoint = this.getCurrentCell();

        this._debugPos.style.fill = this.isAlive ? "rgb(255,255,255)" : "rgb(255,32,32)";
        this._debugPos.text = "Player(" + this.name + ")\tPosition: (x: " + this.x + ", y: " + this.y + ") \tCell: (x: " + cellPoint.x + ", y: "+ cellPoint.y + ") [" + ((this.x - this.level.gridOffset.x) % this.level.cellSize) + "," + ((this.y - this.level.gridOffset.y) % this.level.cellSize) + "]" + (!this.isAlive ? "!!DEAD!!" : "");
    }

    _update( msSinceLastFrame, currentTime ) {
        if(!this.isAlive) return;

        this._updateGraphics();
        this._updateDebug();

        // let's make sure the record is properly loaded
        if(this._dsUser && this._record.isReady === false ) {
            return;
        }

        // data contains the user's input. We'll be using it a lot, so let's get it once

        if(this._dsUser) {
            var data = this._record.get();

            this.name = data.name;

            if (data.active) {
                this.move(data.direction);
            }
        }

        this._updateMove();
        this._checkCollision();
        this._checkClaimConditions();
    }

    _updateGraphics() {
        // update gfx position
        this.view.position.x = this.x;
        this.view.position.y = this.y;
        this._text.text = this.name === "" ? "---" : this.name;
    }

    _initGraphics() {
        this.view = new PIXI.Container();
        this._viewParts = {
            body: new PIXI.Container(),
           // trail: this._trail.view
        };
        this.view.addChild(this._viewParts.body);

        //this._stage.alpha = 0.5;
        this._viewParts.body.position.x = 0;
        this._viewParts.body.position.y = 0;
        this._viewParts.body.pivot.x = 0;
        this._viewParts.body.pivot.y = 0;
        this._viewParts.body.height = this.height + 30;
        this._viewParts.body.width = this.width;

        var texture = PIXI.Texture.fromImage('/res/img/player.png');

        this._body = new PIXI.Sprite(texture);
        this._body.tint = this.tint;
        this._body.height = this.height;
        this._body.width = this.width;
        this._body.anchor.x = 0;
        this._body.anchor.y = 0;
        this._viewParts.body.addChild(this._body);


        this._text = new PIXI.Text( this.name, {
            fontSize: 18,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: this.tint,
            align : 'center',
            dropShadow: true,
            dropShadowAlpha: 0.55,
            dropShadowBlur: 2,
            dropShadowColor: '#333333',
            dropShadowDistance: 0,
            stroke: 'black',
            strokeThickness: 1.5,
            lineJoin: 'round',
            padding: 5,
            trim: true
        });
        // this._text.height = this.height;
        // this._text.width = this.width;
        this._text.position.x = this.width / 2;
        this._text.position.y = this.height + 30;
        this._text.anchor.x = 0.5;
        this._text.anchor.y = 1;
        //this._text.alpha = 50;
        this._viewParts.body.addChild( this._text );
    }

};
