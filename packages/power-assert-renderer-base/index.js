'use strict';

class BaseRenderer {
    init (traversal) {
        traversal.on('start', (context) => {
            this.onStart(context);
        });
        traversal.on('data', (esNode) => {
            this.onData(esNode);
        });
        traversal.on('end', () => {
            this.onEnd();
        });
    }
    setWritable (writable) {
        this.writable = writable;
    }
    // API
    onStart (context) {
    }
    // API
    onData (esNode) {
    }
    // API
    onEnd () {
    }
    // API
    write (str) {
        this.writable.write(str);
    }
}

module.exports = BaseRenderer;
