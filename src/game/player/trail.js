/**
 * Created by truda on 10/05/2017.
 */

module.exports = class Trail {

    constructor(player) {
        this._player = player;
        this.points = new Set();
        this._gfx = new PIXI.Container();
        this._gfxFill = new PIXI.Graphics();
        this._gfxOutline = new PIXI.Graphics();
        this._gfx.addChild(this._gfxOutline);
        this._gfx.addChild(this._gfxFill);
        this._lastPoint = 0;
    }

    reset() {
        this._gfx.alpha = 1;
        this.points = new Set();
        this._gfxFill.clear();
        this._gfxOutline.clear();
        this._lastPoint = 0;
    }

    kill() {
        this._gfx.alpha = 0.5;
    }

    addPoint(x, y) {
        let p = this._player.level.getCellPoint(x,y);

        if(!p.equals(this._lastPoint)) {
            this._lastPoint = p;

            if(this.points.length > 0 || this._player.level.getCellAt(p.x, p.y).owner !== this._player) {
                this.points.add(p);
            }
        }

        this._redraw();
    };

    containsPoint(x, y) {
        let p = this._player.level.getCellPoint(x,y);

        let points = [...this.points];
        for(var i=0;i < points.length - 1;i++) { // -1 to ignore last
            var point = points[i];
            if(p.equals(point)) {
                return true;
            }
        }
        return false;
    }

    _redraw() {
        this._gfxFill.clear();
        this._gfxOutline.clear();

        let size = this._player.level.cellSize;
        let points = [...this.points];

        this._gfxOutline.beginFill(this._player.tint, 0.8);
        this._drawInternal(points, this._gfxOutline, size);
        this._gfxOutline.endFill();

        this._gfxFill.beginFill(0x000000, 0.6);
        this._drawInternal(points, this._gfxFill, size, 2);
        this._gfxFill.endFill();
    }

    _drawInternal(points, gfx, size, shrink=0) {
        for(let i=0; i < points.length; i++) {
            let p = (i>0) ? points[i-1] : null;
            let c = points[i];

            let shrink2 = (2*shrink);

            let x1 = (c.x*size)+shrink;
            let y1 = (c.y*size)+shrink;
            let x2 = ((c.x+1)*size)-shrink;
            let y2 = ((c.y+1)*size)-shrink;

            let last = false;
            if(i+1 === points.length) {
                // only draw half
                last = true;
                //console.log("Last", new PIXI.Point(this._player.x, this._player.y), new PIXI.Point(x1, y1), new PIXI.Point(x2, y2), size, c, p, shrink);
            }

            if(p !== null) {
                if (c.x-p.x > 0) {
                    // TO RIGHT
                    // OVERLAY LEFT
                    x1 -= shrink2;
                    if(last) {
                        x2 = this._player.x + size - shrink;
                    }
                }
                else if(c.x-p.x < 0) {
                    // TO LEFT
                    x2 += shrink2;
                    if(last) {
                        x1 = this._player.x + shrink;
                    }
                }
                else if(c.y-p.y > 0) {
                    // TO DOWN
                    // OVERLAY TOP
                    y1 -= shrink2;
                    if(last) {
                        y2 = this._player.y + size - shrink;
                    }
                }
                else if(c.y-p.y < 0) {
                    // TO UP
                    y2 += shrink2;
                    if(last) {
                        y1 = this._player.y + shrink;
                    }
                }
            }


            gfx.drawRect(x1, y1, x2-x1, y2-y1);
            if(last){
                //console.log("--", new PIXI.Point(x1,y1), new PIXI.Point(x2,y2));
            }
        }
    }
};

function dist(x1,y1,x2,y2) {
    return Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
}