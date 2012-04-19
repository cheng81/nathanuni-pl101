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

var citer = function(expr,defs) {
	var estack = [expr];
	var tstack = [0];
	var out = [];
	while(estack.length !== 0) {
		var cur = estack.pop();
		var instr = (typeof cur==='string') ? cur : cur.tag;
		switch(instr) {
			case 'swap':
				if(tstack.length<2) {throw new Error('?cannot swap less than 2 elements');}
				var a = tstack.pop(), b = tstack.pop();
				tstack.push(b); tstack.push(a);
				break;
			case 'max':
				if(tstack.length<2) {throw new Error('?cannot max between less than 2 elements');}
				var a = tstack.pop(), b = tstack.pop();
				tstack.push( (a>b ? a : b) );
				break;
			case 'note':
				out.push( cNote(cur,tstack[0]) );
			case 'rest':
				tstack[0] += cur.dur;
				break;
			case 'seq':
				estack.push(cur.right);
				estack.push(cur.left);
				break;
			case 'par':
				estack.push('max');
				estack.push(cur.right);
				estack.push('swap');
				estack.push(cur.left);
				tstack.push(tstack[0]);
				break;
			case 'repeat':
				for(var i=0; i<cur.count; i++) {
					estack.push(cur.section);
				}
				break;
			case 'ref':
				estack.push(defs[cur.name]);
				break;
			default: throw new Error('Unknown tag: ' + instr);
		}
	}
	return out;
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
	return citer(musexpr, definitions, 0);
};

module.exports.compile = compile;