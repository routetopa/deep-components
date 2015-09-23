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

({
  readyCallback: function () {
    this._root = this.createShadowRoot();
    this._root.appendChild(this.template.content.cloneNode());
    if (this.parentElement) {
      start.call(this);
    }
  },
  insertedCallback: start,
  removedCallback: stop,
  tick: function () {
    var now = new Date();
    this._root.querySelector('hh').textContent = fmt(now.getHours());
    this._root.querySelector('sep').style.visibility =
        now.getSeconds() % 2 ? 'visible' : 'hidden';
    this._root.querySelector('mm').textContent = fmt(now.getMinutes());
  }
});