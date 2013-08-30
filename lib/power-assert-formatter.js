/**
 * power-assert-formatter.js - Default formatter for empowered assertions
 *
 * https://github.com/twada/empower
 *
 * Copyright (c) 2013 Takuto Wada
 * Licensed under the MIT license.
 *   https://raw.github.com/twada/empower/master/MIT-LICENSE.txt
 */
(function (root, factory) {
    'use strict';

    // using returnExports UMD pattern
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.powerAssertFormatter = factory();
    }
}(this, function () {
    'use strict';

    var newRowFor = (function () {
        function createRow (numCols, initial) {
            var row = [], i;
            for(i = 0; i < numCols; i += 1) {
                row[i] = initial;
            }
            return row;
        }
        return function (assertionLine) {
            return createRow(widthOf(assertionLine), ' ');
        };
    })();

    function widthOf (str) {
        var i, c, width = 0;
        for(i = 0; i < str.length; i+=1){
            c = str.charCodeAt(i);
            if ((0x0 <= c && c < 0x81) || (c === 0xf8f0) || (0xff61 <= c && c < 0xffa0) || (0xf8f1 <= c && c < 0xf8f4)) {
                width += 1;
            } else {
                width += 2;
            }
        }
        return width;
    }

    function isOverlapped (prevCapturing, nextCaputuring, dumpedValue) {
        return (typeof prevCapturing !== 'undefined') && prevCapturing.location.start.column <= (nextCaputuring.location.start.column + widthOf(dumpedValue));
    }

    function rightToLeft (a, b) {
        return b.location.start.column - a.location.start.column;
    }

    function PowerAssertContextRenderer (dump, context) {
        this.dump = dump;
        this.initialVertivalBarLength = 1;
        this.initWithContext(context);
    }
    PowerAssertContextRenderer.prototype.initWithContext = function (context) {
        context.events.sort(rightToLeft);
        this.events = context.events;
        this.assertionLine = context.content;
        this.assertionLocation = context.location;
        this.rows = [];
        for (var i = 0; i <= this.initialVertivalBarLength; i += 1) {
            this.addOneMoreRow();
        }
    };
    PowerAssertContextRenderer.prototype.addOneMoreRow = function () {
        this.rows.push(newRowFor(this.assertionLine));
    };
    PowerAssertContextRenderer.prototype.lastRow = function () {
        return this.rows[this.rows.length - 1];
    };
    PowerAssertContextRenderer.prototype.renderVerticalBarAt = function (columnIndex) {
        var i, lastRowIndex = this.rows.length - 1;
        for (i = 0; i < lastRowIndex; i += 1) {
            this.rows[i].splice(columnIndex, 1, '|');
        }
    };
    PowerAssertContextRenderer.prototype.renderValueAt = function (columnIndex, dumpedValue) {
        var i, width = widthOf(dumpedValue);
        for (i = 0; i < width; i += 1) {
            this.lastRow().splice(columnIndex + i, 1, dumpedValue.charAt(i));
        }
    };
    PowerAssertContextRenderer.prototype.constructRows = function (capturedEvents) {
        var that = this,
            prevCaptured;
        capturedEvents.forEach(function (captured) {
            var dumpedValue = that.dump(captured.value);
            if (isOverlapped(prevCaptured, captured, dumpedValue)) {
                that.addOneMoreRow();
            }
            that.renderVerticalBarAt(captured.location.start.column);
            that.renderValueAt(captured.location.start.column, dumpedValue);
            prevCaptured = captured;
        });
    };
    PowerAssertContextRenderer.prototype.renderLines = function () {
        var lines = [];
        this.constructRows(this.events);
        if (this.assertionLocation.path) {
            lines.push('# ' + [this.assertionLocation.path, this.assertionLocation.start.line].join(':'));
        } else {
            lines.push('# at line: ' + this.assertionLocation.start.line);
        }
        lines.push('');
        lines.push(this.assertionLine);
        this.rows.forEach(function (columns) {
            lines.push(columns.join(''));
        });
        lines.push('');
        return lines;
    };


    function jsonDump (obj) {
        var seen = [],
            replacer = function(key, val) {
                if (typeof val === 'object' && val) {
                    if (seen.indexOf(val) !== -1) {
                        return '#Circular#';
                    }
                    seen.push(val);
                }
                return val;
            },
            str = JSON.stringify(obj, replacer);
        if (typeof str === 'undefined') {
            return 'undefined';
        }
        return str;
    }


    return {
        dump: jsonDump,
        format: function (context) {
            var renderer = new PowerAssertContextRenderer(this.dump, context);
            return renderer.renderLines();
        },
        PowerAssertContextRenderer: PowerAssertContextRenderer
    };
}));
