var c = function(expr,start,out) {
	switch(expr.tag) {
		case 'note': 
			out.push({tag:'note',pitch:expr.pitch,start:start,dur:expr.dur});
			return start+expr.dur;
		case 'seq':
			return c(expr.right,(c(expr.left,start,out)),out);
		case 'par':
			var e1 = c(expr.left,start,out);
			var e2 = c(expr.right,start,out);
			return e1>e2 ? e1 : e2;
	}
};
var compile = function(musexpr) {
	var out = [];
	c(musexpr,0,out);
	return out;
};

module.exports.compile = compile;