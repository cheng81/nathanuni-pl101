var compile = require('./compile').compile;

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
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));