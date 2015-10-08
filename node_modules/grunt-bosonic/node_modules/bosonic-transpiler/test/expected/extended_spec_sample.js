(function () {
    var SuperTickTockClockPrototype = Object.create(TickTockClock.prototype, {
            tick: {
                enumerable: true,
                value: function () {
                    this._super.tick.call(this);
                    console.log('tick');
                }
            }
        });
    window.SuperTickTockClock = document.registerElement('super-tick-tock-clock', { prototype: SuperTickTockClockPrototype });
    Object.defineProperty(SuperTickTockClock.prototype, '_super', {
        enumerable: false,
        writable: false,
        configurable: false,
        value: TickTockClock.prototype
    });
}());