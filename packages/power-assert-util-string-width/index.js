'use strict';

const eaw = require('eastasianwidth');

function stringWidth (ambiguousCharWidth) {
    return function widthOf (str) {
        let width = 0;
        for(let i = 0; i < str.length; i+=1) {
            const code = eaw.eastAsianWidth(str.charAt(i));
            switch(code) {
            case 'F':
            case 'W':
                width += 2;
                break;
            case 'H':
            case 'Na':
            case 'N':
                width += 1;
                break;
            case 'A':
                width += ambiguousCharWidth;
                break;
            }
        }
        return width;
    };
}

module.exports = stringWidth(2);
module.exports.narrow = stringWidth(1);
