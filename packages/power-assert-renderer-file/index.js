'use strict';

const BaseRenderer = require('power-assert-renderer-base');

class FileRenderer extends BaseRenderer {
  onStart (context) {
    this.filepath = context.source.filepath;
    this.lineNumber = context.source.line;
  }
  onEnd () {
    if (this.filepath) {
      this.write(`# ${[this.filepath, this.lineNumber].join(':')}`);
    } else {
      this.write(`# at line: ${this.lineNumber}`);
    }
  }
}

module.exports = FileRenderer;
