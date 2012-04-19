var convertPitch = function(pitch) {
	var sharp = pitch.length===3;
	var octave = sharp ? parseInt(pitch[2],10) : parseInt(pitch[1],10);
	var p0 = pitch[0].toUpperCase();
	var pitchNum =
		p0==='A' ? 9 :
		p0==='B' ? 11 :
		p0==='C' ? 0 :
		p0==='D' ? 2 :
		p0==='E' ? 4 :
		p0==='F' ? 5 :
		p0==='G' ? 7 : -1;

	if(pitchNum<0) {throw new Error('Wrong pitch',pitch);}
	return 12 + 12 * (octave + (sharp ? 1 : 0)) + pitchNum;
};

var cNote = function(note,start) {
	return {
		tag: 'note',
		pitch: note.pitch,
		// pitch: convertPitch(note.pitch),
		start: start,
		dur: note.dur
	};
};

var make = function(ast) {
	switch(ast.tag) {
		case 'note': return new Note(ast);
		case 'rest': return new Rest(ast);
		case 'seq': return new Seq(make(ast.left),make(ast.right));
		case 'par': return new Par(make(ast.left),make(ast.right));
		case 'repeat': return new Repeat(ast.count,make(ast.section));
		case 'ref': return new Ref(ast);
	}
}
var makeMus = function(expr,defs) {
	var elem = make(expr);
	var cdefs = {};
	for(var i in defs) {
		if(defs.hasOwnProperty(i)) {
			cdefs[i] = make(defs[i]);
		}
	}
	var out = [];
	console.log('compilers',require('util').inspect(elem,true,100));
	elem.compile(0,out,cdefs);
	return out;
};

var Element = function(ast) {this.ast=ast;}
var Pair = function(fst,snd) {this.fst=fst;this.snd=snd;}

var Note = function(ast) {
	Element.call(this,ast);
}
Note.prototype.compile = function(time,out) {
	out.push(cNote(this.ast,time));
	return time + this.ast.dur;
};
var Rest = function(ast) {
	Element.call(this,ast);
};
Rest.prototype.compile = function(time,out) {
	return time + this.ast.dur;
};
var Seq = function(a,b) {
	Pair.call(this,a,b);
};
Seq.prototype.compile = function(time,out,defs) {
	return this.snd.compile(this.fst.compile(time,out,defs),out,defs);
};
var Par = function(a,b) {
	Pair.call(this,a,b);
}
Par.prototype.compile = function(time,out,defs) {
	return Math.max(
	this.fst.compile(time,out,defs),
	this.snd.compile(time,out,defs)
	);
};
var Repeat = function(count,sec) {
	Element.call(this,sec);
	this.count = count;
};
Repeat.prototype.compile = function(time,out,defs) {
	var t = time;
	for (var i = 0; i < this.count; i++) {
		t = this.ast.compile(t,out,defs);
	}
	return t;
};
var Ref = function(ast) {
	Element.call(this,ast);
};
Ref.prototype.compile = function(time,out,defs) {
	return defs[this.ast.name].compile(time,out,defs);
};

var nonRecur = function(name,expr) {
	switch(expr.tag) {
		case 'note':
		case 'rest': return true;
		case 'seq':
		case 'par': nonRecur(name,expr.left); nonRecur(name,expr.right); return true;
		case 'repeat': nonRecur(name,expr.section); return true;
		case 'ref': if(expr.name==name) {throw new Error('Recursive "'+name+'" definition!');} else {return true;}
	}
};
var sanity = function(defs) {
	for(var i in defs) {
		if(defs.hasOwnProperty(i)) {
			nonRecur(i,defs[i]);
		}
	}
};
var compile = function(musexpr,definitions) {
	sanity(definitions);
	return makeMus(musexpr,definitions);
};

module.exports.compile = compile;