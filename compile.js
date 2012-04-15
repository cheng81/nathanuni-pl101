var convertPitch = function(pitch) {
	var octave = parseInt(pitch[1],10);
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
	return 12 + (12 * octave) + pitchNum;
};

var cNote = function(note,start) {
	return {
		tag:'note',
		pitch: convertPitch(note.pitch),
		start: start,
		dur: note.dur
	};
};

var c = function(expr,definitions,start,out) {
	var top = out===undefined;
	out = out||[];
	var newtime = start;
	switch(expr.tag) {
		case 'note': 
			out.push(cNote(expr,start));
			newtime = start+expr.dur;
			break;
		case 'rest':
			out.push({tag:'rest',start:start,dur:expr.duration});
			newtime = start+expr.duration;
			break;
		case 'seq':
			newtime = c(expr.right,definitions,(c(expr.left,definitions,start,out)),out);
			break;
		case 'par':
			newtime = Math.max( c(expr.left,definitions,start,out),c(expr.right,definitions,start,out) );
			break;
		case 'repeat':
			for (var i = 0; i < expr.count; i++) {
				newtime = c(expr.section,definitions,newtime,out); 
			};
			break;
		case 'ref':
			newtime = c(definitions[expr.name],definitions,start,out);
			break;
	}
	if(top===true) {return out;}
	return newtime;
};

var compile = function(musexpr,definitions) {
	return c(musexpr, definitions, 0);
};

module.exports.compile = compile;