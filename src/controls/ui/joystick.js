/**
 * Created by truda on 13/05/2017.
 */

(function( $ ) {
    $.fn.joystick = function(opts) {

        function Joystick(element, options) {

            var defaultOptions = {
                onStart: null, // when input has started
                onChange: null, // on changed event handler
                onStop: null, // when input has stopped
            };

            this.options = $.extend(true, {}, defaultOptions, options);


            this.x = 0;
            this.y = 0;

            this._cX = 0;
            this._cY = 0;
            this._radius = 0;
            this._knobRadius = 0;

            this._pad = element;
            this._stick = null;
            this._knob = null;

            this._init = function () {
                if (!this._pad.has('.joystick-stick').length) {
                    this._stick = $('<div class="joystick-stick"></div>');
                    this._pad.prepend(this._stick);
                }
                else {
                    this._stick = this._pad.find(".joystick-stick").first();
                }

                if (!this._pad.has('.joystick-knob').length) {
                    this._knob = $('<div class="joystick-knob"></div>');
                    this._pad.append(this._knob);
                }
                else {
                    this._knob = this._pad.find(".joystick-knob").first();
                }

                this._stick.css('pointer-events','none');
                this._knob.css('pointer-events','none');

                this._pad.on('touchstart mousedown', this._onStart.bind(this));
                this._pad.on('touchstart touchmove', this._onTouch.bind(this));
                this._pad.on('mouseup touchend', this._onEnd.bind(this));

                $(window).on('resize', this._onResize.bind(this));

                this._updateOffset();
            };

            this._onStart = function (event) {
                event.preventDefault();
                //console.log("start");

                this.__mouseHandlers = {mousemove: this._onMouse.bind(this), mouseup: this._onEnd.bind(this)};
                $(document).on(this.__mouseHandlers);

                if($.isFunction(this.options.onStart)) {
                    this.options.onStart.call(this);
                }
            };

            this._onEnd = function () {
                $(document).off(this.__mouseHandlers);

                if($.isFunction(this.options.onStop)) {
                    this.options.onStop.call(this);
                }

                this.reset();
            };

            this._onMouse = function (event) {
               // console.log("mouse", event, this._cX, event.pageX - this._cX, this._cY, event.pageY - this._cY);
                this._setPosition(event.pageX - this._cX, event.pageY - this._cY);
            };

            this._onTouch = function (event) {
                event.preventDefault();

                var touch = event.targetTouches[0];
                if (touch) {
                    this._setPosition(touch.clientX - this._cX, touch.clientY - this._cY);
                }
            };

            this._onResize = function(event) {
                this._updateOffset(false);
            };

            this._updateOffset = function (animate) {
                if(typeof(animate) === 'undefined') animate = false;

                this._radius = this._pad.width() / 2;
                this._pad.height(this._pad.width());

                this._knobRadius = this._knob.width() / 2 + parseInt(this._knob.css('borderWidth').replace('px', ''));
                this._knob.height(this._knob.width());

                var offset = this._pad.offset();

                this._cX = offset.left + this._radius;
                this._cY = offset.top + this._radius;

                this.reset(animate);
            };

            this._setPosition = function (x, y) {
                y = -Math.min(this._radius - this._knobRadius, Math.max(-this._radius + this._knobRadius, y));
                x = Math.min(this._radius - this._knobRadius, Math.max(-this._radius + this._knobRadius, x));

                // check its in the bounds
                var angle = Math.PI / 2 + Math.atan2(y, x);

                // distance from center
                var dX = Math.abs(x);
                var dY = Math.abs(y);

                var d = Math.min(this._radius - this._knobRadius, Math.sqrt(dX * dX + dY * dY));

                var maxX = d * Math.sin(angle);
                var maxY = d * Math.cos(angle);

                var top = maxY + this._radius;
                var left = maxX + this._radius;

                this._knob.css({top: top, left: left});
                this._stick.css({
                    height: d + "px",
                    transform: "rotate(" + (360 - ((angle / Math.PI * 180) + 360) % 360) + "deg)"
                });


                var valueX = Math.min(1, Math.max(-1, maxX/(this._radius-this._knobRadius)));
                var valueY = Math.min(1, Math.max(-1, maxY/(this._radius-this._knobRadius)));

                if(valueX !== this.x || valueY !== this.y) {
                    this.x = valueX;
                    this.y = valueY;

                    if($.isFunction(this.options.onChange)) {
                        this.options.onChange.call(this, {x: this.x, y: this.y});
                    }
                }
            };

            this.reset = function (animate) {
                if(typeof(animate) === 'undefined') animate = true;

                if(animate) {
                    this._knob.stop().animate({top: this._radius, left: this._radius}, {
                        duration: 200,
                        easing: 'easeOutBack'
                    });
                    this._stick.stop().animate({height: 0}, {duration: 200, easing: 'easeOutBack'});
                }
                else {
                    this._knob.stop().css({top: this._radius, left: this._radius});
                    this._stick.stop().css({height: 0});
                }
            };


            this._init();
        }

        return new Joystick($(this), opts);
    };
}( jQuery ));