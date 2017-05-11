/**
 * Created by truda on 10/05/2017.
 */
module.exports = class Cell {
    constructor(level, row, col) {
        this.level = level;
        this.row = row;
        this.col = col;
        this.fill = 0xfafafa;
        this.owner = null;
    }

    claim(player) {
        this.owner = player;
        if(this.owner !== null) {
            this.fill = this.owner.tint;
        }
        else {
            this.fill = 0xfafafa;
        }
        this._paint(this.level.tiles);
    }

    unclaim() {
        this.claim(null);
    }

    _paint(gfx) {
        gfx.lineStyle(0,0,0);
        gfx.beginFill(this.fill, 1);
        gfx.drawRect(this.level.gridOffset.x + (this.row * this.level.cellSize), this.level.gridOffset.y + (this.col * this.level.cellSize),this.level.cellSize,this.level.cellSize);
        gfx.endFill();
    }
};
