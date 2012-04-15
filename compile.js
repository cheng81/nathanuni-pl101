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

var c = function(expr,start,out) {
	switch(expr.tag) {
		case 'note': 
			out.push({tag:'note',pitch:convertPitch(expr.pitch),start:start,dur:expr.dur});
			return start+expr.dur;
		case 'rest':
			out.push({tag:'rest',start:start,dur:expr.duration});
			return start+expr.duration;
		case 'seq':
			return c(expr.right,(c(expr.left,start,out)),out);
		case 'par':
			var e1 = c(expr.left,start,out);
			var e2 = c(expr.right,start,out);
			return e1>e2 ? e1 : e2;
		case 'repeat':
			var s = start;
			for (var i = 0; i < expr.count; i++) {
				s = c(expr.section,s,out); 
			};
			return s;
	}
};
var compile = function(musexpr) {
	var out = [];
	c(musexpr,0,out);
	return out;
};

module.exports.compile = compile;