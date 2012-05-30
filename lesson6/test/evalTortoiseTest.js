var assert = require('chai').assert
  , expect = require('chai').expect
  , tortoise = require('../lib')
  , util = require('util');

var Turtle = function(container, w, h) {
	console.log('Turtle constructor called',w,h);
};
Turtle.prototype.clear = function() {
	this.updateTurtle();
};
Turtle.prototype.top = function() {
};
Turtle.prototype.push = function() {
};
Turtle.prototype.pop = function() {
};
Turtle.prototype.updateTurtle = function() {
};
Turtle.prototype.drawTo = function(x,y) {
};
Turtle.prototype.forward = function(d) {
	this.updateTurtle();
};
Turtle.prototype.right = function(ang) {
	this.updateTurtle();
};
Turtle.prototype.left = function(ang) {
	this.updateTurtle();
};
Turtle.prototype.penUp = function() {
};
Turtle.prototype.penDown = function() {
};
Turtle.prototype.home = function() {
};
Turtle.prototype.opacity = function(o) {
};
Turtle.prototype.colorRGB = function(r,g,b) {
};
Turtle.prototype.stroke = function(w) {
};

var turtle = new Turtle();
var env = tortoise.bootstrap(turtle);

var ast = function(text,rule) {
	return tortoise.parser.parse(text,rule);
}
var eval = function(text) {
	var ast = tortoise.parser.parse(text);
	console.log('ast',util.inspect(ast,false,100));
	return tortoise.interpreter.evalStatements(ast,env);
}
var evalExpr = function(text) {
	var ast = tortoise.parser.parse(text,'expression');
	return tortoise.interpreter.evalExpression(ast,env);
}
var evalStmt = function(text) {
	var ast = tortoise.parser.parse(text,'statement');
	return tortoise.interpreter.evalStatement(ast,env);
}

var eq = function(a,b) {
	assert.deepEqual(a,b);
}

suite('Parser', function() {
	test('number', function() {
		eq(ast('-5.2','number'),-5.2);
	});
	test('identifier', function() {
		eq(ast('foobar','identifier'),'foobar');
	});
	test('expression', function() {
		eq(ast('1 + 2 * 3 ** 4','expression'),
			{tag:'+',
			left: 1,
			right: {
				tag:'*',
				left: 2,
				right: {
					tag: '**',
					left: 3,
					right: 4
				}
			}});
	});
	test('statements', function() {
		eq(ast('var a; a := 10;','statements'),
			[{
				tag: 'var',
				name: 'a'
			}, {
				tag: ':=',
				left: 'a',
				right: 10
			}]);
	});
	test('if', function() {
		eq(ast('if (a == 10) { a := a - 1; }','statement'),
			{
				tag: 'if',
				expr: {
					tag: '==',
					left: {
						tag: 'ident',
						name: 'a'
					},
					right: 10
				},
				body: [
					{
						tag: ':=',
						left: 'a',
						right: {
							tag: '-',
							left: {
								tag: 'ident',
								name: 'a'
							},
							right: 1
						}
					}
				],
				elsebody: ''
			});
	});
	test('define', function() {
		eq(ast('define foo (a) { a + 1; }','statement'),
		{
			tag: 'define',
			name: 'foo',
			args: ['a'],
			body: [
			{
				tag: 'ignore',
				body: {
					tag: '+',
					left: {tag:'ident',name:'a'},
					right: 1
				}
			}
			]
		});
	});
	test('declare-var', function() {
		eq(ast('var foobar;','statement'),
		{
			tag: 'var', name: 'foobar'
		});
	});
	test('assign-var', function() {
		eq(ast('foobar := foobar * 2;','statement'),
		{
			tag: ':=',
			left: 'foobar',
			right: {
				tag: '*',
				left: {tag:'ident',name:'foobar'},
				right: 2
			}
		});
	});
});

suite('evalExpression', function() {
	test('number', function() {
		eq(evalExpr('-5.2'),-5.2);
	});
	test('comparison', function() {
		eq(evalExpr('1 > 2'),false);
		eq(evalExpr('1 == 1'),true);
		eq(evalExpr('1 < 2'),true);
		eq(evalExpr('1 <= 1'),true);
		eq(evalExpr('1 >= 2'),false);
	});
	test('arithmetic', function() {
		eq(evalExpr('1 + 2'),3);
		eq(evalExpr('1 + 2 * 3'),7);
		eq(evalExpr('5 % 2 + 1'),2);
	});
	test('logic', function() {
		eq(evalExpr('true && false'),false);
		eq(evalExpr('true || false'),true);
		eq(evalExpr('!false'),true);
		eq(evalExpr('1 > 3 || (true && ! 1 > 3)'),true);
	});
	test('inline-if', function() {
		eq(evalExpr('1 > 2 ? true : false'),false);
	});
});

suite('evalStatement', function() {
	test('var', function() {
		env.bindings['foobar'] = 5;
		eq(evalStmt('foobar;'),5);
	});
	test('assignment', function() {
		env.bindings['foobar'] = 5;
		evalStmt('foobar := 3;',env);
		eq(env.bindings['foobar'],3);
	});
	test('if', function() {
		eq(evalStmt('if (1 == 1) { 5; }'),5);
		eq(evalStmt('if (2 == 1) { 5; }'),undefined);
		eq(evalStmt('if (2 == 1) { 5; } else { 3; }'),3);
	});
	test('repeat', function() {
		env.bindings['foobar'] = 1;
		evalStmt('repeat(4) { foobar := foobar + 1; }');
		eq(env.bindings['foobar'],5);
	});
});

suite('functions', function() {
	test('define, call',function() {
		eq(eval('define foo (a) {a+2;}\n foo(5);'),7);
	});

	test('define, curry, call', function() {
		eq(eval("define foo(a,b) {\
			a+b;}\
			var myfoo;\
			myfoo := foo(5);\
			myfoo(2);"),7);
	});

	test('too many arguments', function() {
		expect(function() {
			eval("define foo(a) { a+1; };\
				foo(1,2,3);")
		}).to.throw();
	});
});
