/**
 * Created by truda on 09/05/2017.
 */
angular.module("PaperCast")
    .controller("viewGameController", function() {

    })
    .factory("viewGameRender", function() {
        var service = {};


        class Game extends EventEmitter{
            constructor(element) {
                this._element = element;

                this.players = [];

                this.stage = new PIXI.Container();

                this.renderer = PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, {transparent: true}, false );
                this._element.append( this.renderer.view );

                this._lastFrameTime = 0;

                requestAnimationFrame( this._tick.bind( this ) );
            }

            addPlayer( name ) {
                var x = this.renderer.width * ( 0.1 + Math.random() * 0.8 );
                var y = this.renderer.height * ( 0.1 + Math.random() * 0.8 );
                this.players.push( new Player( this, x, y, name ) );
            }

            removePlayer( name ) {
                for( var i = 0; i < this.players.length; i++ ) {
                    if( this.players[ i ].name === name ) {
                        this.players[ i ].remove();
                        this.players.splice( i, 1 );
                    }
                }
            }

            _tick(currentTime) {
                this.emit( 'update', currentTime - this._lastFrameTime, currentTime );

                // store the time
                this._lastFrameTime = currentTime;

                this.renderer.render( this.stage );

                requestAnimationFrame( this._tick.bind( this ) );
            }
        }

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

        class Player {
            constructor(game, x, y, name) {
                this._game = game;

                // public properties
                this.name = name;
                this.tint = this._getTint();

                this._textStyle = { font : '14px Arial', fill: 'rgb(0,255,0)', align : 'center' };
                this._text = new PIXI.Text( name, this._textStyle );
                this._text.anchor.x = 0.5;
                this._text.anchor.y = 0.5;
                this._game.stage.addChild( this._text )

                this._stage = new PIXI.Container();
                this._stage.position.x = x;
                this._stage.position.y = y;

                var texture = PIXI.Texture.fromImage('/img/player.png', true, PIXI.settings.SCALE_MODE.LINEAR);

                this._body = new PIXI.Sprite(texture);
                this._body.tint = this.tint;

                var s = this._body.width / this._body.height;
                this._body.height = 64;
                this._body.width = this._body.height * s;
                this._body.anchor.x = 0.5;
                this._body.anchor.y = 0.5;
                this._stage.addChild(this._body);

                this._game.stage.addChild(this._stage);
                this._game.on( 'update', this._update.bind( this ) );
            }

            remove() {
                this._game.stage.removeChild( this._stage );
                this._game.stage.removeChild( this._text );
            }

            _getTint() {
                var sum = 0, i;

                for( i = 0; i < this.name.length; i++ ) {
                    sum += this.name.charCodeAt( i );
                }

                return TINTS[ sum % TINTS.length ];
            }

            _update( msSinceLastFrame, currentTime ) {

                // The text is not in the container (so that it doesn't rotate with the ship). Let's
                // move it individually
                this._text.position.x = this._stage.position.x;
                this._text.position.y = this._stage.position.y + 45;

            }
        }

        return function(e) {
            var g = new Game(e);
            g.addPlayer("TruDan");
            return g;
        };
    })
    .directive("viewGame", function(viewGameRender) {
        return {
            restrict: 'E',
            controller: "viewGameController",
            link: function (scope, element, attr) {
                var game = viewGameRender(element);
            }
        };
    });