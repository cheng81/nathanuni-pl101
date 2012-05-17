var tortoise = require('./tortoise')
  //, turtlelib = require('./turtle')
  , add_binding = tortoise.add_binding

var makeEnv = function(turtle) {
	var init_env = {};

	for(var i in turtle) {
		if(turtle[i] instanceof Function) {
			console.log('bind function turtle.'+i);
			var bound = turtle[i].bind(turtle);
			bound.tortoiseArity = turtle[i].length;
			add_binding(init_env,i,bound);
			//add_binding(init_env,i,turtle[i].bind(turtle));
		}
	}

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