(function () {
    var SuperButtonPrototype = Object.create(HTMLButtonElement.prototype, {
            dummy: {
                enumerable: true,
                value: function () {
                    console.log('bar');
                }
            }
        });
    window.SuperButton = document.registerElement('super-button', {
        prototype: SuperButtonPrototype,
        extends: 'button'
    });
    Object.defineProperty(SuperButton.prototype, '_super', {
        enumerable: false,
        writable: false,
        configurable: false,
        value: HTMLButtonElement.prototype
    });
}());