'use strict';

const ContextTraversal = require('power-assert-context-traversal');
const StringWriter = require('./string-writer');
const defaultOptions = require('./default-options');

/**
 * options.pipeline [array]
 * options.outputOffset [number]
 * options.lineSeparator [string]
 */
function createFormatter (options) {
    const formatterConfig = Object.assign({}, defaultOptions(), options);
    const pipelineConfigs = formatterConfig.pipeline;
    const len = pipelineConfigs.length;

    return (powerAssertContext) => {
        const writer = new StringWriter(formatterConfig);
        const traversal = new ContextTraversal(powerAssertContext);
        pipelineConfigs.forEach((config) => {
            let HandlerClass, handler;
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
        });
        traversal.traverse();
        writer.write('');
        return writer.toString();
    };
}

createFormatter.StringWriter = StringWriter;
module.exports = createFormatter;
