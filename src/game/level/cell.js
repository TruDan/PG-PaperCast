/**
 * Created by truda on 10/05/2017.
 */
module.exports = class Cell {
    constructor(level, row, col, size) {
        this.level = level;
        this.row = row;
        this.col = col;
        this.size = size;
        this.center = { x: 0, y: 0 };
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
        gfx.drawRect(this.row  * this.size,this.col * this.size,this.size,this.size);
        gfx.endFill();
    }
};
