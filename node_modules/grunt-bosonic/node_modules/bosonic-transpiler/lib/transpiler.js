/*
 * Bosonic transpiler
 * https://github.com/bosonic/transpiler
 *
 * Copyright (c) 2013 Raphaël Rougeron
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('underscore'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    estraverse = require('estraverse'),
    sweet = require('sweet.js');

function camelize(str) {
    var camelized = str.replace(/(\-|_|\.|\s)+(.)?/g, function(match, separator, chr) {
        return chr ? chr.toUpperCase() : '';
    }).replace(/^([A-Z])/, function(match, separator, chr) {
        return match.toLowerCase();
    });
    return camelized.charAt(0).toUpperCase() + camelized.slice(1);
}
String.prototype.camelize = function() {
    return camelize(this);
};

function decamelize(str) {
    str = str.charAt(0).toLowerCase() + str.slice(1);
    return str.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
}
String.prototype.decamelize = function() {
    return decamelize(this);
};

function shimSelector(selector, elementName) {
    var shimed = false,
        selectorRegexes = [
            [/^:host\(([^:]+)\)$/, elementName+'$1'],
            [/^:host(:hover|:active|:focus)$/, elementName+'$1'],
            [/^:host(\[[^:]+\])$/, elementName+'$1'],
            [/^:host$/, elementName],
            [/^:ancestor\(([^:]+)\)$/, '$1 '+elementName], // deprecated; replaced by :host-context
            [/^:host-context\(([^:]+)\)$/, '$1 '+elementName],
            [/^::content/, elementName],
        ];

    for (var i = 0; i < selectorRegexes.length; i++) {
        var re = selectorRegexes[i];
        if (selector.match(re[0])) {
            shimed = true;
            selector = selector.replace(re[0], re[1]);
            break;
        }
    }
    if (!shimed && !selector.match(new RegExp(elementName))) {
        selector = elementName + ' ' + selector;
    }
    return selector;
}

function shimStyles(styles, elementName) {
    var css = require('css'),
        parseTree = css.parse(styles);

    parseTree.stylesheet.rules.forEach(function(rule) {
        rule.selectors.forEach(function(selector, i, selectorsRef) {
            selectorsRef[i] = shimSelector(selector, elementName);
        });
    });

    return css.stringify(parseTree);
}

function preCompile(elementName, script, template, extendee) {
    var sourceAst = esprima.parse(script, { loc: true }),
        fullElementName = extendee ? "'" + elementName + "' extends '" + extendee + "'" : "'" + elementName + "'";

    // According to the spec, the last value of the <script> must be an object whose properties will define 
    // the new element's API. This object must therefore be wrapped in an ExpressionStatement
    var exprStmt = sourceAst.body[sourceAst.body.length - 1];
    if (exprStmt.type !== 'ExpressionStatement') {
        throw new Error('The last value of the <script> must be an ExpressionStatement');
    }
    if (exprStmt.expression.type !== 'ObjectExpression') {
        throw new Error('The last value of the <script> must be an ExpressionStatement whose expression must be an object literal');
    }

    // We grab all the code prior to the ExpressionStatement and prepend it to the code to output
    var outerCode = [];
    for (var i = 0; i <= sourceAst.body.length - 2; i++) {
        outerCode.push(escodegen.generate(sourceAst.body[i]));
    }

    var precompiledCode = outerCode.join("\n");
    precompiledCode+= '\ndef__element ' + fullElementName + ' ' + escodegen.generate(exprStmt.expression) + '\n';
    if (template) {
        template = "'"+template.replace(/\r?\n/g, '')+"'";
        precompiledCode+= '\ndef__template "' + elementName + '" ' + template + '\n'; 
    }
    
    return precompiledCode;
}

function compile(precompiledCode) {
    var macros = fs.readFileSync(__dirname + '/macros/element.sjs', 'utf8')
        + '\n' + fs.readFileSync(__dirname + '/macros/template.sjs', 'utf8');
    return sweet.compile(macros + '\n' + precompiledCode, { readableNames: true }).code;
}

function transpile(htmlString) {
    var mainScript,
        sourceAst,
        scriptDeps = [],
        cssDeps = [],
        $ = cheerio.load(htmlString),
        element = $('element'),
        template = $('template').html(),
        style = $('style').html(),
        scripts = $('script'),
        stylesheets = $('link[rel=stylesheet]'),
        elementName = element.attr('name'),
        extendee = element.attr('extends');

    scripts.each(function(i, script) {
        if ($(this).attr('src')) {
            scriptDeps.push($(this).attr('src'));
        } else {
            if (mainScript !== undefined) {
                throw new Error('Only one <script> is permitted in a Web Component declaration');
            }
            mainScript = $(this).html();
        }
    });

    stylesheets.each(function(i, link) {
        cssDeps.push($(this).attr('href'));
    });

    if (style !== null) {
        style = shimStyles(style, elementName);
    }

    // We can't normalize whitespace during the first parse because it will normalize WS in the JS too
    if (template !== null) {
        $ = cheerio.load(htmlString, {
            normalizeWhitespace: true
        });
        template = $('template').html();
    }

    if (mainScript === undefined) {
        throw new Error('A <script> is mandatory in a Web Component declaration');
    }
    
    var precompiledCode = preCompile(elementName, mainScript, template, extendee);

    var output = '(function () {\n' + compile(precompiledCode) + '\n}());\n';

    // We do another pass with Esprima in order to indent JS code correctly
    var outputAst = esprima.parse(output);
    output = escodegen.generate(outputAst);

    return {
        js: output,
        css: style,
        template: template,
        scripts: scriptDeps,
        stylesheets: cssDeps
    };
}

exports = module.exports = {
    transpile: transpile,
    preCompile: preCompile,
    compile: compile,
    shimStyles: shimStyles,
    shimSelector: shimSelector
}

