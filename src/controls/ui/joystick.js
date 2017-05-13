/**
 * Created by truda on 13/05/2017.
 */

(function( $ ) {
    $.fn.joystick = function() {

        //this._area.on( 'touchstart mousedown', this._onStart.bind( this ) );
        //this._area.on( 'mousedown mousemove', this._onMouse.bind( this ) );
        //this._area.on( 'touchstart touchmove', this._onTouch.bind( this ) );
        //this._area.on( 'mouseup touchend', this._onEnd.bind( this ) );


        this.x = 0;
        this.y = 0;
        this._radius = 0;

        this._stickWidth = 0;
        this._knobRadius = 0;


        this._cX = 0;
        this._cY = 0;

        this._pad = this;
        this._stick = this.find(".joystick-stick:first");
        this._knob = this.find(".joystick-knob:first");

        this._onStart = function(e) {
            e.preventDefault();

        };

        this._onEnd = function(e) {
            e.preventDefault();

            this._knob.stop().animate({top:this._radius, left: this._radius},{duration:200,easing:'easeOutBack'});
            this._stick.stop().animate({height: 0},{duration:200,easing:'easeOutBack'});
        };

        this._onMouse = function(e) {
            e.preventDefault();
            //console.log("mouse", this._cX, e.offsetX, this._cY, e.offsetY);
            this._setPosition(e.offsetX, e.offsetY);
        };

        this._onTouch = function(e) {
            e.preventDefault();

            var touch = event.targetTouches[0];
            if(touch) {
                //console.log("touch", this._cX, touch.clientX, this._cY, touch.clientY);
                this._setPosition(touch.clientX-this._cX, touch.clientY-this._cY);
            }
        };

        this._updateOffset = function() {
            this._radius = this._pad.width()/2;
            this._pad.height(this._pad.width());

            this._knobRadius = this._knob.width()/2 + parseInt(this._knob.css('borderWidth').replace('px',''));
            this._knob.height(this._knob.width());

            var offset = this._pad.offset();

            this._cX = offset.left + this._radius;
            this._cY = offset.top + this._radius;

            this._knob.stop().animate({top:this._radius, left: this._radius},{duration:200,easing:'easeOutBack'});
            this._stick.stop().animate({height: 0},{duration:200,easing:'easeOutBack'});
        };

        this._setPosition = function(x, y) {
            this.x = x;
            this.y = y;
            //console.log("input", x, y);

            y = -Math.min(this._radius - this._knobRadius, Math.max(-this._radius + this._knobRadius, y));
            x = Math.min(this._radius - this._knobRadius, Math.max(-this._radius + this._knobRadius, x));

            // check its in the bounds
            var angle = Math.PI / 2 + Math.atan2(y, x);

            // distance from center
            var dX = Math.abs(x);
            var dY = Math.abs(y);

            var d = Math.min(this._radius - this._knobRadius, Math.sqrt(dX*dX + dY*dY));

            var maxX = d * Math.sin(angle);
            var maxY = d * Math.cos(angle);

            var top = maxY + this._radius;
            var left = maxX + this._radius;

           // console.log("setPos", this._cX, this._cY, this._radius, this._knobRadius, x, left, y, top);
            this._knob.css({top: top, left: left});
            this._stick.css({height: d + "px", transform: "rotate(" + (360-((angle / Math.PI * 180)+360) % 360) + "deg)"});
        };

        this._pad.on('touchstart mousedown', this._onStart.bind(this));
        this._pad.on('mousedown mousemove', this._onMouse.bind(this));
        this._pad.on('touchstart touchmove', this._onTouch.bind(this));
        this._pad.on('mouseup touchend', this._onEnd.bind(this));

        this._updateOffset();

        return this;
    };
}( jQuery ));