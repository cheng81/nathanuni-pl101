var tortoise = require('./tortoise')
  , turtlelib = require('./turtle')
  , add_binding = tortoise.add_binding

var makeEnv = function(raphael,w,h) {
	var init_env = {};

	var make = function() {
		var out = new turtlelib.Turtle(raphael,w,w||h);
		console.log('turtle made');
		out.clear();
		return out;
	};
	make.tortoiseArity = 0;

	var clone = function(turtle) {
		var out = new turtlelib.Turtle(raphael,w,w||h,turtle);
		console.log('turtle cloned');
		return out;
	};
	clone.tortoiseArity = 1;

	add_binding(init_env, 'make', make);
	add_binding(init_env, 'clone', clone);
	add_binding(init_env, 'width', w);
	add_binding(init_env, 'height', w||h);

	var consts = ['E','LN2','LOG2E','LOG10E','PI','SQRT1_2','SQRT2'];
	var funs = ['abs','acos','asin','atan','atan2','ceil','cos','exp','floor','log','max','min','pow','random','round','sin','sqrt','tan'];
	for(var i=0; i<consts.length; i++) {
		console.log('bind Math.'+consts[i]);
		add_binding(init_env,consts[i],Math[consts[i]]);
	}
	for(var i=0; i<funs.length; i++) {
		var name = funs[i];
		console.log('bind function Math.'+name);
		var bound = Math[name].bind(Math);
		bound.tortoiseArity = Math[name].length;
		add_binding(init_env,name,bound);
	}

	return init_env;
}

module.exports.makeEnv = makeEnv;

/*
		for(var i in out) {
			if(out[i] instanceof Function) {
				console.log('bind function turtle.'+i);
				var bound = out[i].bind(out);
				bound.tortoiseArity = out[i].length;
				add_binding(init_env,i,bound);
			}
		}

*/