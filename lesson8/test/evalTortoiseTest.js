var assert = require('chai').assert
  , expect = require('chai').expect
  , tortoise = require('../lib')
  , util = require('util');

var ast = function(text,rule) {
	return tortoise.parser.parse(text,rule);
}
var eval = function(text) {
	// var ast = tortoise.parser.parse(text);
	// console.log('ast',util.inspect(ast,false,100));
	return tortoise.eval(text);
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
		eq(ast('define foo (a) { a+1; }','statement'),
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
			eval("define foo(a) { a+1; }\
				foo(1,2,3);")
		}).to.throw();
	});
});

suite('threading', function() {
	test('start thread, increment', function() {
		eq(eval(
			'define incr() {\
				lock(a) {\
					repeat(10) {\
						log(a);\
						a := a+1;\
					}\
				}\
			}\
			var a := 0;\
			spawn incr();\
			repeat(10) {\
				log(-1);\
			}\
			a;'),10);
	});
	test('competing threads!', function() {
		eq(eval(
			'var a := 10;\
			define consumer() {\
				lock(consumer) {\
				repeat (10) {\
					lock(a){\
					a := a-1;\
					}\
				}\
				}\
			}\
			define producer() {\
				lock(producer) {\
				repeat (10) {\
					lock(a){\
					a := a+1;\
					log(a);\
					}\
				}\
				}\
			}\
			spawn consumer();\
			spawn producer();\
			yield;\
			lock(consumer) {\
				lock(producer) {\
					log(-3);\
					5;\
				}\
			}'),5);
	})
});

suite('exception', function() {
	test('throw/catch', function() {
		eq(eval(
			'try {\
				throw 5;\
			} catch e {\
				e;\
			}'), 5);
	});
	test('throw/catch in function', function() {
		eq(eval(
			'define thrower(n) {\
				if(n<0) {\
					throw 0;\
				} else {\
					n + 1;\
				}\
			}\
			try {\
				thrower(5);\
				thrower(-5);\
			} catch e {\
				0;\
			}'),0);
	});
});

suite('recursive functions', function() {
	test('fibonacci', function() {
		eq(eval(
			'define fib(a) {\
				if(a==0 || a==1) {\
					log(a);\
					1;\
				} else {\
					log(a);\
					log(a-1);\
					log(a-2);\
					fib(a-1) + fib(a-2);\
				}\
			}\
			fib(5);'),8);
	});
});









