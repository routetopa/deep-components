(function () {
    var BModalPrototype = Object.create(BDialog.prototype, {
            dummy: {
                enumerable: true,
                value: function () {
                    console.log('bar');
                }
            }
        });
    window.BModal = document.registerElement('b-modal', { prototype: BModalPrototype });
    Object.defineProperty(BModal.prototype, '_super', {
        enumerable: false,
        writable: false,
        configurable: false,
        value: BDialog.prototype
    });
}());