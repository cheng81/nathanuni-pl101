var PEG = require('pegjs')
  , should = require('should')
  , fs = require('fs')

var parse = PEG.buildParser( fs.readFileSync('./scheem.pegjs','utf-8') ).parse;


should.deepEqual(
	parse('a','atom'),
	'a'
	);
should.deepEqual(
	parse('(a b c)','list'),
	['a','b','c']
	);
should.deepEqual(
	parse("'a",'quote'),
	['quote','a']
	);
should.deepEqual(
	parse("'(a b c)",'quote'),
	['quote',['a','b','c']]
	);

should.deepEqual(
	parse("(a '(b c))"),
	['a',['quote',['b','c']]]
	);
should.deepEqual(
	parse('(a b);;(c d e)'),
	['a','b']);