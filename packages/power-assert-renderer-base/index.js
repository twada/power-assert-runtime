'use strict';

class BaseRenderer {
  init (traversal) {
    this.traversal = traversal;
    traversal.on('start', (context) => {
      this.onStart(context);
    });
    traversal.on('data', (esNode) => {
      this.onData(esNode);
    });
    traversal.on('arg:enter', (capturedArgument) => {
      this.onArg(capturedArgument);
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
  onArg (capturedArgument) {
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
