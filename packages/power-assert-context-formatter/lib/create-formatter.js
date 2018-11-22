'use strict';

var assign = require('core-js/library/fn/object/assign');
var ContextTraversal = require('power-assert-context-traversal');
var StringWriter = require('./string-writer');
var defaultOptions = require('./default-options');
var reduce = require('core-js/library/fn/array/reduce');

/**
 * options.pipeline [array]
 * options.outputOffset [number]
 * options.lineSeparator [string]
 */
function createFormatter (options) {
    var formatterConfig = assign({}, defaultOptions(), options);
    var pipelineConfig = formatterConfig.pipeline;
    var len = pipelineConfig.length;

    return function (powerAssertContext) {
        var writer = new StringWriter(formatterConfig);
        var traversal = new ContextTraversal(powerAssertContext);
        for (var i = 0; i < len; i += 1) {
            var HandlerClass;
            var handler;
            var config = pipelineConfig[i];
            if (typeof config === 'object') {
                HandlerClass = config.ctor;
                handler = new HandlerClass(config.options);
            } else if (typeof config === 'function') {
                HandlerClass = config;
                handler = new HandlerClass();
            }
            handler.init(traversal);
            if (typeof handler.setWritable === 'function') {
                handler.setWritable(writer);
            }
        }
        traversal.traverse();
        writer.write('');
        return writer.toString();
    };
}

createFormatter.StringWriter = StringWriter;
module.exports = createFormatter;
