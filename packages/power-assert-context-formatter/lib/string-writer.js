'use strict';

function spacerStr (len) {
    let str = '';
    for(let i = 0; i < len; i += 1) {
        str += ' ';
    }
    return str;
}

class StringWriter {
    constructor(config) {
        this.lines = [];
        this.lineSeparator = config.lineSeparator;
        this.regex = new RegExp(this.lineSeparator, 'g');
        this.spacer = spacerStr(config.outputOffset);
    }
    write (str) {
        this.lines.push(this.spacer + str.replace(this.regex, this.lineSeparator + this.spacer));
    }
    toString () {
        const str = this.lines.join(this.lineSeparator);
        this.lines.length = 0;
        return str;
    }
}

module.exports = StringWriter;
