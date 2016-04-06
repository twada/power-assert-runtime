'use strict';

var extend = require('xtend');
var ContextTraversal = require('power-assert-context-traversal');
var StringWriter = require('./string-writer');
var defaultOptions = require('./default-options');

module.exports = function createFormatter (options) {
    var config = extend(defaultOptions(), options);
    var rendererClasses = config.renderers;
    var len = rendererClasses.length;

    return function (powerAssertContext) {
        var traversal = new ContextTraversal(powerAssertContext);
        var writer = new StringWriter(config);
        for (var i = 0; i < len; i += 1) {
            var RendererClass = rendererClasses[i];
            var renderer = new RendererClass();
            renderer.register(traversal);
            renderer.setDestination(writer);
        }
        traversal.traverse();
        writer.write('');
        return writer.toString();
    };
};
