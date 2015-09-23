var BTestPrototype = Object.create(HTMLElement.prototype, {
        width: {
            enumerable: true,
            get: function () {
                return 100;
            }
        },
        height: {
            enumerable: true,
            get: function () {
                return 50;
            }
        },
        margin: {
            enumerable: true,
            set: function (val) {
                this.val = val;
            }
        }
    });
window.BTest = document.registerElement('b-test', { prototype: BTestPrototype });