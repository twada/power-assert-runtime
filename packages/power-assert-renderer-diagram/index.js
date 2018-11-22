'use strict';

const BaseRenderer = require('power-assert-renderer-base');
const stringifier = require('stringifier');
const stringWidth = require('power-assert-util-string-width');
const defaultOptions = require('./lib/default-options');
const createRow = (numCols, initial) => new Array(numCols).fill(initial);
const rightToLeft = (a, b) => b.leftIndex - a.leftIndex;

/**
 * options.stringify [function]
 * options.maxDepth [number]
 * options.lineSeparator [string]
 * options.anonymous [string]
 * options.circular [string]
 * 
 * options.widthOf [function]
 * options.ambiguousEastAsianCharWidth [number]
 */
class DiagramRenderer extends BaseRenderer {
    constructor (config) {
        super();
        this.config = Object.assign({}, defaultOptions(), config);
        this.events = [];
        if (typeof this.config.stringify === 'function') {
            this.stringify = this.config.stringify;
        } else {
            this.stringify = stringifier(this.config);
        }
        if (typeof this.config.widthOf === 'function') {
            this.widthOf = this.config.widthOf;
        } else {
            this.widthOf = (this.config.ambiguousEastAsianCharWidth === 1) ? stringWidth.narrow : stringWidth;
        }
        this.initialVertivalBarLength = 1;
    }
    onStart (context) {
        this.assertionLine = context.source.content;
        this.initializeRows();
    }
    onData (esNode) {
        if (!esNode.isCaptured) {
            return;
        }
        this.events.push({value: esNode.value, leftIndex: esNode.range[0]});
    }
    onEnd () {
        this.events.sort(rightToLeft);
        this.constructRows(this.events);
        this.rows.forEach((columns) => {
            this.write(columns.join(''));
        });
    }
    initializeRows () {
        this.rows = [];
        for (let i = 0; i <= this.initialVertivalBarLength; i += 1) {
            this.addOneMoreRow();
        }
    }
    newRowFor (assertionLine) {
        return createRow(this.widthOf(assertionLine), ' ');
    }
    addOneMoreRow () {
        this.rows.push(this.newRowFor(this.assertionLine));
    }
    lastRow () {
        return this.rows[this.rows.length - 1];
    }
    renderVerticalBarAt (columnIndex) {
        const lastRowIndex = this.rows.length - 1;
        for (let i = 0; i < lastRowIndex; i += 1) {
            this.rows[i].splice(columnIndex, 1, '|');
        }
    }
    renderValueAt (columnIndex, dumpedValue) {
        const width = this.widthOf(dumpedValue);
        for (let i = 0; i < width; i += 1) {
            this.lastRow().splice(columnIndex + i, 1, dumpedValue.charAt(i));
        }
    }
    isOverlapped (prevCapturing, nextCaputuring, dumpedValue) {
        return (typeof prevCapturing !== 'undefined') && this.startColumnFor(prevCapturing) <= (this.startColumnFor(nextCaputuring) + this.widthOf(dumpedValue));
    }
    constructRows (capturedEvents) {
        let prevCaptured;
        capturedEvents.forEach((captured) => {
            const dumpedValue = this.stringify(captured.value);
            if (this.isOverlapped(prevCaptured, captured, dumpedValue)) {
                this.addOneMoreRow();
            }
            this.renderVerticalBarAt(this.startColumnFor(captured));
            this.renderValueAt(this.startColumnFor(captured), dumpedValue);
            prevCaptured = captured;
        });
    }
    startColumnFor(captured) {
        return this.widthOf(this.assertionLine.slice(0, captured.leftIndex));
    }
}

module.exports = DiagramRenderer;
