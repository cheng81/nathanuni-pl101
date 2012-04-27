var PEG = require('pegjs')
  , should = require('should')
  , fs = require('fs')

var parse = PEG.buildParser( fs.readFileSync('./mus.pegjs','utf-8') ).parse;

should.deepEqual(
	parse('c4 100','note'),
	{tag:'note',pitch:'c4',dur:100}
	);
should.deepEqual(
	parse('_ 100','prim'),
	{tag:'rest',dur:100}
	);