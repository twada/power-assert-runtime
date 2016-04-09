'use strict';

function BaseRenderer () {
}

BaseRenderer.prototype.register = function (traversal) {
    var _this = this;
    traversal.on('start', function (context) {
        _this.onStart(context);
    });
    traversal.on('data', function (esNode) {
        _this.onData(esNode);
    });
    traversal.on('end', function () {
        _this.onEnd();
    });
};

BaseRenderer.prototype.onStart = function (context) {
};

BaseRenderer.prototype.onData = function (esNode) {
};

BaseRenderer.prototype.onEnd = function () {
};

BaseRenderer.prototype.setDestination = function (writable) {
    this.writable = writable;
};

BaseRenderer.prototype.write = function (str) {
    this.writable.write(str);
};

module.exports = BaseRenderer;
