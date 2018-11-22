'use strict';

const BaseRenderer = require('power-assert-renderer-base');
const stringWidth = require('power-assert-util-string-width');
const createRow = (numCols, initial) => new Array(numCols).fill(initial);

class AssertionRenderer extends BaseRenderer {
    onStart (context) {
        this.context = context;
        this.assertionLine = context.source.content;
    }
    onEnd () {
        this.write('');
        this.write(this.assertionLine);
        const e = this.context.source.error;
        if (e && e instanceof SyntaxError) {
            const re = /Unexpected token \(1\:(\d+)\)/;
            const matchResult = re.exec(e.message);
            if (matchResult) {
                const syntaxErrorIndex = Number(matchResult[1]);
                this.renderValueAt(syntaxErrorIndex, '?');
                this.renderValueAt(syntaxErrorIndex, '?');
                this.renderValueAt(syntaxErrorIndex, e.toString());
                this.renderValueAt(0, '');
                this.renderValueAt(0, 'If you are using `babel-plugin-espower` and want to use experimental syntax in your assert(), you should set `embedAst` option to true.');
                this.renderValueAt(0, 'see: https://github.com/power-assert-js/babel-plugin-espower#optionsembedast');
            }
        }
    }
    renderValueAt (idx, str) {
        const row = createRow(stringWidth(this.assertionLine), ' ');
        replaceColumn(idx, row, str);
        this.write(row.join(''));
    }
}

function replaceColumn (columnIndex, row, str) {
    const width = stringWidth(str);
    for (let i = 0; i < width; i += 1) {
        row.splice(columnIndex + i, 1, str.charAt(i));
    }
}

module.exports = AssertionRenderer;
