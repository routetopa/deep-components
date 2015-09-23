var fs = require('fs'),
    transpiler = require('../'),
    sweet = require('sweet.js');

exports.testSimpleTranspilation = function(test) {
    test.expect(4);
    var transpiled = transpiler.transpile(fs.readFileSync(__dirname + '/fixtures/spec_sample.html', 'utf8')),
        expected = {
            js: fs.readFileSync(__dirname + '/expected/spec_sample.js', 'utf8'),
            css: fs.readFileSync(__dirname + '/expected/spec_sample.css', 'utf8')
        };
    test.equal(transpiled.js, expected.js, "the JS should be transpiled");
    test.equal(transpiled.css, expected.css, "the CSS should be shimmed");
    test.equal(transpiled.scripts.length, 0);
    test.equal(transpiled.stylesheets.length, 0);
    test.done();
}

exports.testExtendsTranspilation = function(test) {
    test.expect(1);
    var transpiled = transpiler.transpile(fs.readFileSync(__dirname + '/fixtures/extended_spec_sample.html', 'utf8')),
        expected = fs.readFileSync(__dirname + '/expected/extended_spec_sample.js', 'utf8');
    test.equal(transpiled.js, expected, "the JS should be transpiled");
    test.done();
}

exports.testExtendsNativeElementTranspilation = function(test) {
    test.expect(1);
    var transpiled = transpiler.transpile(fs.readFileSync(__dirname + '/fixtures/extended_native_element.html', 'utf8')),
        expected = fs.readFileSync(__dirname + '/expected/extended_native_element.js', 'utf8');
    test.equal(transpiled.js, expected, "the JS should be transpiled");
    test.done();
}

exports.testExtendsBosonicElementTranspilation = function(test) {
    test.expect(1);
    var transpiled = transpiler.transpile(fs.readFileSync(__dirname + '/fixtures/extended_bosonic_element.html', 'utf8')),
        expected = fs.readFileSync(__dirname + '/expected/extended_bosonic_element.js', 'utf8');
    test.equal(transpiled.js, expected, "the JS should be transpiled");
    test.done();
}

exports.testScriptDependency = function(test) {
    test.expect(1);
    var transpiled = transpiler.transpile(fs.readFileSync(__dirname + '/fixtures/sample_with_deps.html', 'utf8')),
        expected = {
            scripts: ["../node_modules/moment/moment.js", "../node_modules/pikaday/pikaday.js"]
        };
    test.deepEqual(transpiled.scripts, expected.scripts, "the script dependencies should be found");
    test.done();
}

exports.testStylesheetDependency = function(test) {
    test.expect(1);
    var transpiled = transpiler.transpile(fs.readFileSync(__dirname + '/fixtures/sample_with_deps.html', 'utf8')),
        expected = {
            stylesheets: ["../node_modules/pikaday/css/pikaday.css"]
        };
    test.deepEqual(transpiled.stylesheets, expected.stylesheets, "the stylesheets dependencies should be found");
    test.done();
}

exports.testStylesShiming = function(test) {
    var tests = [
        [':host', 'b-dummy'],
        [':host:hover', 'b-dummy:hover'],
        [':host[visible]', 'b-dummy[visible]'],
        [':host(.cssClass)', 'b-dummy.cssClass'],
        [':ancestor(.cssClass)', '.cssClass b-dummy'],
        [':host-context(.cssClass)', '.cssClass b-dummy'],
        ['p', 'b-dummy p'],
        ['b-dummy', 'b-dummy'],
        ['b-dummy p', 'b-dummy p'],
        ['::content p', 'b-dummy p']
    ];
    test.expect(tests.length);
    tests.forEach(function(rule) {
        test.equal(transpiler.shimSelector(rule[0], 'b-dummy'), rule[1]);
    });
    test.done();
}

exports.testStylesheetShiming = function(test) {
    var stylesheet = fs.readFileSync(__dirname + '/fixtures/shadowCSS_sample.css', 'utf8'),
        shimmed = fs.readFileSync(__dirname + '/expected/shimed_shadowCSS_sample.css', 'utf8');
    
    test.expect(1);
    test.equal(transpiler.shimStyles(stylesheet, 'b-dummy'), shimmed);
    test.done();
}

exports.testPreCompile = function(test) {
    test.expect(1);
    var script = fs.readFileSync(__dirname + '/fixtures/spec_sample_script.js', 'utf8'),
        code = transpiler.preCompile('b-test', script, '<div><content></content></div>'),
        expected = fs.readFileSync(__dirname + '/expected/precompiled_spec_sample_script.js', 'utf8');
    test.equal(code, expected);
    test.done();
}

exports.testCompile = function(test) {
    test.expect(1);
    var code = transpiler.compile(fs.readFileSync(__dirname + '/expected/precompiled_spec_sample_script.js', 'utf8')),
        expected = fs.readFileSync(__dirname + '/expected/compiled_spec_sample_script.js', 'utf8');
    test.equal(code, expected);
    test.done();
}

exports.testGetterSetterBug = function(test) {
    test.expect(1);
    var code = transpiler.compile(fs.readFileSync(__dirname + '/fixtures/getter_setter_bug.js', 'utf8')),
        expected = fs.readFileSync(__dirname + '/expected/getter_setter_bug.js', 'utf8');
    test.equal(code, expected);
    test.done();
}
