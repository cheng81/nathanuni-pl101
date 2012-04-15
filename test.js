var compile = require('./compile').compile;
var parser = require('./parser')

var melody_mus = 
    { tag: 'par',
      left: 
       { tag: 'seq',
         // left: { tag: 'note', pitch: 'a4', dur: 250 },
         left: {tag:'rest',duration:300},
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'repeat',
  section: { tag: 'note', pitch: 'b4', dur: 250 },
  count: 3 } }};
         // right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));

//test parser
console.log('test mus parser');
var fs = require('fs');
var mus = parser.parse(fs.readFileSync('./test.mus','utf8'));
console.log(mus);
var compiled = compile(mus.expr,mus.definitions);
console.log('compiled',compiled);
