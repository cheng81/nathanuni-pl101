var compile = require('./compile_iter').compile;
var util = require('util');
var iparser = require('./infix')

var melody_mus = 
    { tag: 'par',
      left: 
       { tag: 'seq',
         // left: { tag: 'note', pitch: 'a4', dur: 250 },
         left: {tag:'rest',dur:300},
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'repeat',
  section: { tag: 'note', pitch: 'b4', dur: 250 },
  count: 3 } }};
         // right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log('ast',melody_mus);
console.log('notes',compile(melody_mus));

// test parser
console.log('test mus parser');
var fs = require('fs');
var imus = iparser.parse(fs.readFileSync('./infix.mus','utf8'));
console.log(imus);
var icompiled = compile(imus.expr,imus.definitions);
console.log('compiled',util.inspect(icompiled,true,100));

// icompiled = iparser.parse('4 * (2 * c1 100,c2 100)| c4 100');

// console.log('compiled',util.inspect(icompiled,true,100));
