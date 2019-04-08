'use strict';

var signature = require('call-signature');
var decorate = require('./decorate');

function Decorator (receiver, config) {
    this.receiver = receiver;
    this.config = config;
    this.onError = config.onError;
    this.onSuccess = config.onSuccess;
    this.signatures = config.patterns.map(parse);
    this.wrapOnlySignatures = config.wrapOnlyPatterns.map(parse);
}

Decorator.prototype.enhancement = function () {
    var that = this;
    var container = this.container();
    var wrappedMethods = [];

    function attach(matcherSpec, enhanced) {
        var matcher = matcherSpec.parsed;
        var methodName = detectMethodName(matcher.callee);
        if (typeof that.receiver[methodName] !== 'function' || wrappedMethods.indexOf(methodName) !== -1) {
            return;
        }
        var callSpec = {
            thisObj: that.receiver,
            func: that.receiver[methodName],
            numArgsToCapture: numberOfArgumentsToCapture(matcherSpec),
            matcherSpec: matcherSpec,
            enhanced: enhanced
        };
        container[methodName] = callSpec.enhancedFunc = decorate(callSpec, that);
        wrappedMethods.push(methodName);
    }

    this.signatures.filter(methodCall).forEach(function (matcher) {
        attach(matcher, true);
    });

    this.wrapOnlySignatures.filter(methodCall).forEach(function (matcher) {
        attach(matcher, false);
    });

    return container;
};

Decorator.prototype.container = function () {
    var basement = {};
    if (typeof this.receiver === 'function') {
        var candidates = this.signatures.filter(functionCall);
        var enhanced = true;
        if (candidates.length === 0) {
            enhanced = false;
            candidates = this.wrapOnlySignatures.filter(functionCall);
        }
        if (candidates.length === 1) {
            var callSpec = {
                thisObj: null,
                func: this.receiver,
                numArgsToCapture: numberOfArgumentsToCapture(candidates[0]),
                matcherSpec: candidates[0],
                enhanced: enhanced
            };
            basement = callSpec.enhancedFunc = decorate(callSpec, this);
        }
    }
    return basement;
};

Decorator.prototype.concreteAssert = function (callSpec, invocation, context) {
    var func = callSpec.func;
    var thisObj = this.config.bindReceiver ? callSpec.thisObj : invocation.thisObj;
    var enhanced = callSpec.enhanced;
    var args = invocation.values;
    var message = invocation.message;
    var matcherSpec = callSpec.matcherSpec;

    if (context && typeof this.config.modifyMessageBeforeAssert === 'function') {
        message = this.config.modifyMessageBeforeAssert({originalMessage: message, powerAssertContext: context});
    }
    args = args.concat(message);

    var data = {
        thisObj: invocation.thisObj,
        assertionFunction: callSpec.enhancedFunc,
        originalMessage: message,
        defaultMessage: matcherSpec.defaultMessage,
        matcherSpec: matcherSpec,
        enhanced: enhanced,
        args: args
    };

    if (context) {
        data.powerAssertContext = context;
    }

    return this._callFunc(func, thisObj, args, data);
};

// see: https://github.com/twada/empower-core/pull/8#issuecomment-173480982
Decorator.prototype._callFunc = function (func, thisObj, args, data) {
    var ret;
    try {
        ret = func.apply(thisObj, args);
    } catch (e) {
        data.assertionThrew = true;
        data.error = e;
        return this.onError.call(thisObj, data);
    }
    data.assertionThrew = false;
    data.returnValue = ret;
    return this.onSuccess.call(thisObj, data);
};

function numberOfArgumentsToCapture (matcherSpec) {
    var matcher = matcherSpec.parsed;
    var len = matcher.args.length;
    var lastArg;
    if (0 < len) {
        lastArg = matcher.args[len - 1];
        if (lastArg.name === 'message' && lastArg.optional) {
            len -= 1;
        }
    }
    return len;
}


function detectMethodName (callee) {
    if (callee.type === 'MemberExpression') {
        return callee.member;
    }
    return null;
}


function functionCall (matcherSpec) {
    return matcherSpec.parsed.callee.type === 'Identifier';
}


function methodCall (matcherSpec) {
    return matcherSpec.parsed.callee.type === 'MemberExpression';
}

function parse(matcherSpec) {
    if (typeof matcherSpec === 'string') {
        matcherSpec = {pattern: matcherSpec};
    }
    var ret = {};
    Object.keys(matcherSpec).forEach(function (key) {
        ret[key] = matcherSpec[key];
    });
    ret.parsed = signature.parse(matcherSpec.pattern);
    return ret;
}


module.exports = Decorator;
