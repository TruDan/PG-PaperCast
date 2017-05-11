/**
 * Created by truda on 10/05/2017.
 */

var PIXI = require("pixi.js");

module.exports = class Viewport {
    constructor(game, width, height) {
        this.game = game;

        this.contentView = new PIXI.Container();

        this.view = new PIXI.Container();
        this.view.addChild(this.contentView);

        this.width = width || 800;
        this.height = height || 600;

        this.mask = new PIXI.Graphics();
        this.contentView.mask = this.mask;

        this.zoom = 1;
        this.camera = new PIXI.Point(0,0);

        this.entities = [];
        this.tracking = [];

        this.trackEntities = true;
        this.trackBound = new PIXI.Rectangle(100, 100, this.width-200, this.height-200);

        this.contentView.pivot.set(this.contentView/2, this.contentView/2);

        this._initBorder();
        this._drawBorder();
        this.__updateMask();

        this._initDebug();
    }

    setPosition(x,y) {
        this.view.position.set(x,y);
        this.mask.position.set(x,y);
        this.__updateMask();
    }

    setSize(width,height) {
        this.width = width;
        this.height = height;
        this._drawBorder();
        this.__updateMask();

        this.centerCamera();
    }

    trackEntity(entity) {
        this.tracking.push(entity);
    }

    untrackEntity(entity) {
        this.tracking.splice(this.tracking.indexOf(entity), 1);
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntity(entity) {
        this.entities.splice(this.entities.indexOf(entity), 1);
    }

    pointCamera(x,y) {
        this.camera.x = x;
        this.camera.y = y;
        this.__updateCamera();
    }

    centerCamera() {
        this.camera.x = this.contentView.width/2;
        this.camera.y = this.contentView.height/2;
        this.__updateCamera();
    }

    moveCamera(x,y) {
        this.camera.x += x;
        this.camera.y += y;
        this.__updateCamera();
    }

    zoomCamera(zoom) {
        this.zoom += zoom;
        this.__updateCamera();
    }

    isPointVisible(x,y) {
        return this.view.getLocalBounds().contains(x, y);
    }

    _fixContentPosition() {

    }


    __isEntityVisible(entity) {
        var bounds = this.view.getLocalBounds();
        return bounds.contains(entity.x, entity.y);
    }

    __updateMask() {
        this.mask.clear();
        this.mask.lineStyle(0);
        this.mask.beginFill(0xffffff, 1);
        this.mask.moveTo(this.view.position.x,this.view.position.y);
        this.mask.lineTo(this.width + this.view.position.x, this.view.position.y);
        this.mask.lineTo(this.width + this.view.position.x, this.height + this.view.position.y);
        this.mask.lineTo(this.view.position.x, this.height + this.view.position.y);
        this.mask.endFill();
    }

    __updateCamera() {
        this.contentView.scale.set(this.zoom);
        this.contentView.position.set(-this.camera.x + (this.width/2), -this.camera.y + (this.height/2));
    }

    __updateEntities() {
        var bounds = this.view.getLocalBounds();
        for(var i=0;i<this.entities.length;i++) {
            var e = this.entities[i];
            e.renderable = bounds.contains(e.position.x, e.position.y);
        }
    }

    _update() {
        this._updateDebug();

        this.__updateEntities();

        if(this.trackEntities) {
            if(this.tracking.length > 0) {
                var p = this.tracking[0];

                //if(!this.trackBound.contains(p.x, p.y)) {
                    this.pointCamera(p.x, p.y);
               // }
            }
        }
    }

    _initBorder() {
        this.gfx = new PIXI.Graphics();
        this.view.addChild(this.gfx);
    }

    _drawBorder() {
        this.gfx.clear();
        this.gfx.lineStyle(5, 0xffffff);
        this.gfx.moveTo(0,0);
        this.gfx.lineTo(this.width, 0);
        this.gfx.lineTo(this.width, this.height);
        this.gfx.lineTo(0, this.height);
        this.gfx.lineTo(0,0);
    }

    _initDebug() {
        this.debugText = new PIXI.Text("ViewPort");
        this.game._addDebugInfo(this.debugText);
    }

    _updateDebug() {
        this.debugText.text = "ViewPort(" + this.width + "," + this.height + ") - Camera (x: " + this.camera.x + ", y: " + this.camera.y + ") - ContentPos: (x: " + this.contentView.position.x + ", y: " + this.contentView.position.y + ")";
    }
};