function start() {
    this.tick();
    this._interval = window.setInterval(this.tick.bind(this), 1000);
}
function stop() {
    window.clearInterval(this._interval);
}
function fmt(n) {
    return (n < 10 ? '0' : '') + n;
}
var BTestPrototype = Object.create(HTMLElement.prototype, {
        readyCallback: {
            enumerable: true,
            value: function () {
                this._root = this.createShadowRoot();
                this._root.appendChild(this.template.content.cloneNode());
                if (this.parentElement) {
                    start.call(this);
                }
            }
        },
        insertedCallback: { value: start },
        removedCallback: { value: stop },
        tick: {
            enumerable: true,
            value: function () {
                var now = new Date();
                this._root.querySelector('hh').textContent = fmt(now.getHours());
                this._root.querySelector('sep').style.visibility = now.getSeconds() % 2 ? 'visible' : 'hidden';
                this._root.querySelector('mm').textContent = fmt(now.getMinutes());
            }
        }
    });
window.BTest = document.registerElement('b-test', { prototype: BTestPrototype });
Object.defineProperty(BTestPrototype, 'template', {
    get: function () {
        var fragment = document.createDocumentFragment();
        var div = fragment.appendChild(document.createElement('div'));
        div.innerHTML = '<div><content></content></div>';
        while (child = div.firstChild) {
            fragment.insertBefore(child, div);
        }
        fragment.removeChild(div);
        return { content: fragment };
    }
});