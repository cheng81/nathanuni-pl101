var util = require('util');

/*
UTILITY
*/
var base = function(name) {
	return {tag:'basetype', name:name};
};
var arrow = function(left,right) {
	return {tag:'arrowtype', left:left, right:right};
};
var list = function(type) {
	return {tag:'listtype', type:type};
};
var tIdent = function(name) {
	return {tag:'identtype', name:name};
};
var typeAbs = function() {
	var tFormal = Array.prototype.slice.call(arguments);
	var tBody = tFormal.pop();
	return ['tabs',tFormal,tBody,[]]; //empty expr
};
var numType = base('num');
var boolType = base('bool');
var unitType = base('unit');
var symType = base('sym');
/**/

var typeExprIf = function(expr, context) {
	var testType = typeExpr(expr[1], context);
	if(testType.name !== 'bool') {
		throw new Error('Wrong test type');
	}
	var A_type = typeExpr(expr[2], context);
	var B_type = typeExpr(expr[3], context);
	if(!(sameType(A_type,B_type))) {
		throw new Error('Not same type');
	}
	return A_type;
};
var typeExprLambdaOne = function(expr, context) {
	var newctx = {bindings:{}, outer:context};
	newctx.bindings[expr[1]] = expr[2];
	return arrow(expr[2], typeExpr(expr[3],newctx));
};
var typeExprQuote = function(expr, context) {
	//Quoting a number, bool or unit(?) its ok.
	//For other strings, there is the 'sym' type
	if(typeof expr === 'number') {return numType;}
	if(typeof expr === 'string') {
		if(expr==='#u') {return unitType;}
		if(expr==='#t'||expr==='#f') {return boolType;}
		return symType;
	}
	//It cannot be something different from an Array,
	//but hey
	if(!(expr instanceof Array)) {
		throw new Error('Wrong quote expression');
	}
	//Only heterogeneous lists
	var the = typeExprQuote(expr[0], context);
	for(var i=1;i<expr.length;i++) {
		var theI = typeExprQuote(expr[i], context);
		if(!sameType(the,theI)) {
			throw new Error('Heterogeneous lists not supported!');
		}
	}
	return list(the);
};
var typeExprDefine = function(expr, context) {
	if(expr.length===3) {
		add_binding(context, expr[1], typeExpr(expr[2],context));	
	} else if(expr.length===4) {
		add_binding(context, expr[1], expr[2]);
		sameType(expr[2], typeExpr(context, expr[3]));
	}
	return unitType;
};
var typeExprSet = function(expr, context) {
	if(!(sameType( typeExpr(expr[1],context), typeExpr(expr[2],context), context ))) {
		throw new Error('Not same type');
	}
	return unitType;
};
var typeExprBegin = function(expr, context) {
	var out;
	for(var i=1; i<expr.length; i++) {
		out = typeExpr(expr[i], context);
	}
	return out;
};
var typeExprTypeAbstration = function(expr, context) {
	var tFormal = expr[1];
	return function() {
		var typeArgs = Array.prototype.slice.call(arguments);
		var newctx = {bindings:{}, outer:context};
		if(tFormal.length !== typeArgs.length) {
			throw new Error('TypeArg mismatch');
		}
		for(var i=0; i<tFormal.length; i++) {
			newctx.bindings[tFormal[i]] = typeArgs[i];
		}
		if(expr[2]==='') {
			return typeSubst(typeExpr(expr[3],newctx),newctx);	
		}
		return typeSubst(expr[2],newctx);
	}
};
var typeExprTypeApplication = function(expr, context) {
	var e = expr[1];
	var t = expr[2];
	var tabs = typeExpr(e,context);
	if(!(tabs instanceof Function)) {
		if(tabs[0]==='tabs') {
			tabs = typeExpr(tabs,context);
		} else {
			throw new Error('Not a type-abstraction');
		}
	}
	var tActual = [];
	for(var i=0;i<t.length;i++) {
		tActual[i] = typeSubst(t[i], context);
	}
	return tabs.apply(null, tActual);
};
var ctr = 0;
var typeExprAppOne = function(expr, context) {
	var c = ctr++;
	var A = expr[0];
	var B = expr[1];
	var A_type = typeExpr(A,context);
	var B_type = typeExpr(B,context);
	if (A_type.tag !== 'arrowtype') {
		console.log('NOT AN ARROW TYPE',A_type);
		throw new Error('Not an arrow type');
	}
	var U_type = A_type.left;
	var V_type = A_type.right;
	if (!(sameType(U_type,B_type,context))) {
		console.log('NOTSAMETYPE',util.inspect(U_type,false,100),util.inspect(B_type,false,100));
		throw new Error('Argument type did not match');
	}
	return V_type;
};

var erase = function(expr) {
	if(typeof expr === 'number' || typeof expr === 'string') {return expr;}
	if(expr instanceof Array) {
		switch(expr[0]) {
			case 'if': return ['if',erase(expr[1]),erase(expr[2]),erase(expr[3])];
			case 'lambda-one': return ['lambda-one',expr[1],erase(expr[3])];
			case 'quote': return expr;
			case 'define':
				if(expr.length===3) {return ['define',expr[1],erase(expr[2])];}
				if(expr.length===4) {return ['define',expr[1],erase(expr[3])];}
			case 'set!': return ['set!',expr[1],erase(expr[2])];
			case 'begin':
				var out = ['begin'];
				for(var i=1;i<expr.length;i++) {
					out[i] = erase(expr[i]);
				}
				return out;
			case 'tabs':
				return erase(expr[3]);
			case 'tapp':
				return erase(expr[1]);
			default: return [erase(expr[0]),erase(expr[1])];
		}
	} else {
		if(expr.tag==='tabs') {return erase(expr[3]);}
	};

	console.log('ERASEERR',util.inspect(expr,false,100));
	throw new Error('Cannot erase typeinfo from ' + expr);
};

var eval = function(expr, ctx) {
	if(typeof expr==='number') {return expr;}
	if(typeof expr==='string') {
		if(expr==='#t' || expr==='#f' || expr==='#u') {return expr;}
		return lookup(ctx, expr);
	}
	switch(expr[0]) {
		case 'if':
			return (eval(expr[1],ctx)) ? (eval(expr[2],ctx)) : (eval(expr[3],ctx));
		case 'lambda-one':
			return function(arg) {
				return eval(expr[2], bind(ctx, expr[1], arg));
			};
		case 'quote': return expr[1];
		case 'define': add_binding(ctx, expr[1], eval(expr[2],ctx)); return null;
		case 'set!': update(ctx, expr[1], eval(expr[2],ctx)); return null;
		case 'begin':
			var out;
			for(var i=1; i<expr.length; i++) {
				out = eval(expr[i],ctx);
			}
			return out;
		default:
			var fn = eval(expr[0],ctx);
			var arg = eval(expr[1],ctx);
			return fn(arg);
	}

};

var typeExpr = function(expr, context) {
	if(typeof expr === 'number') {
		return numType;
	}
	if(typeof expr === 'string') {
		if(expr==='#u') {
			return unitType;
		}
		if(expr==='#t' || expr==='#f') {
			return boolType;
		}
		return lookup(context, expr);
	}
	if(!(expr instanceof Array)) {
		console.log('wrong expr',expr);
		throw new Error('What expression are you?');
	}
	switch(expr[0]) {
		case 'if': return typeExprIf(expr,context);
		case 'lambda-one': return typeExprLambdaOne(expr,context);
		case 'quote': return typeExprQuote(expr[1],context);
		case 'define': return typeExprDefine(expr,context);
		case 'set!': return typeExprSet(expr,context);
		case 'begin': return typeExprBegin(expr,context);
		case 'tabs': return typeExprTypeAbstration(expr,context);
		case 'tapp': return typeExprTypeApplication(expr,context);
		default: return typeExprAppOne(expr,context)
	};
};

var typeSubst = function(body,context) {
	switch(body.tag) {
		case 'basetype': return body;
		case 'identtype': return typeSubst(lookup(context,body.name),context);
		case 'listtype':
			return list(typeSubst(body.type,context));
		case 'arrowtype':
			return arrow( typeSubst(body.left,context), typeSubst(body.right,context) );
		default:
			throw new Error('what type? '+body);
	}
};
var sameType = function(sa,sb,context) {
	var _sameType = function(a,b) {
		if(a instanceof Function || b instanceof Function) {throw new Error('cannot check equality of type abstraction');}
		if(a.tag !== b.tag) {return false;}
		if(a.tag==='basetype') {return a.name===b.name;}
		if(a.tag==='listtype') {return _sameType(a.type,b.type);}
		if(a.tag==='arrowtype') {return _sameType(a.left,b.left) && _sameType(a.right,b.right);}
		if(a.tag==='identtype') {throw new Error('Can check for equality only after typeSubst!');}
	};
	return _sameType(typeSubst(sa,context),typeSubst(sb,context));
};

var lookup = function(env,v) {
    if(env===undefined||env===null||env.bindings===undefined) {
        throw new Error('Value '+v+' not found');
    }
    if(env.bindings[v]!==undefined) {return env.bindings[v];}
    return lookup(env.outer,v);
};
var update = function(env,v,val) {
    if(env===undefined||env===null||env.bindings===undefined) {
        throw new Error('Cannot update non existent value '+v);
    }
    if(env.bindings[v]!==undefined) {
        env.bindings[v]=val;
    } else {
        update(env.outer,v,val);
    }
};
var add_binding = function(env,v,val) {
    env.bindings[v] = val;
    return env;
};
var bind = function(env,v,val) {
    var newBindings = {};
    newBindings[v] = val;
    return {bindings:newBindings, outer:env};
};

var stdlib = function() {
    var EnvBuilder = function() {
        var _env = { bindings:{}, outer:{} };
        var _types = { bindings:{}, outer:{} };
        var s = this;
        this.add = function(k,type,v) {
            _env.bindings[k] = v;
            _types.bindings[k] = type;
            return s;
        };
        this.env = function() {
            return _env;
        };
        this.types = function() {
            return _types;
        };
    };
    var pair = function(fn) {
        return function(x) {
            return function(y) {
                return fn(x,y);
            }
        }
    }
    var eq = function(x,y) {
        if(x instanceof Array) {
            return (y instanceof Array) && listEq(x,y);
        }
        return x===y;
    }
    var listEq = function(x,y) {
        if(x.length !== y.length) {return false;}
        for (var i = 0; i < x.length; i++) {
            if(x[i] instanceof Array) {
                if(y[i] instanceof Array) {
                    if(!listEq(x[i],y[i])) {return false;}
                } else {
                    return false;
                }
            } else if(x[i] !== y[i]) {
                return false;
            }
        };
        return true;
    }

    /*
    (=<num> 4 5)
    (app (app (tapp = num) 4) 5)
    */
    var bld = new EnvBuilder();
    bld
    .add('+',arrow(numType,arrow(numType,numType)),pair(function(x,y) {return x+y;}))
    .add('-',arrow(numType,arrow(numType,numType)),pair(function(x,y) {return x-y;}))
    .add('*',arrow(numType,arrow(numType,numType)),pair(function(x,y) {return x*y;}))
    .add('/',arrow(numType,arrow(numType,numType)),pair(function(x,y) {return x/y;}))
    .add('%',arrow(numType,arrow(numType,numType)),pair(function(x,y) {return x%y;}))
    .add('=',typeAbs('a', arrow( tIdent('a'), arrow( tIdent('a'), boolType ) )),
    	pair(function(x,y) {return eq(x,y);}))
    .add('<',arrow(numType,arrow(numType,boolType)),pair(function(x,y) {return x<y? '#t':'#f';}))
    .add('>',arrow(numType,arrow(numType,boolType)),pair(function(x,y) {return x>y? '#t':'#f';}))
	.add('cons',typeAbs('elt', arrow(tIdent('elt'),arrow(list(tIdent('elt')),list(tIdent('elt'))))),
		function(x) {return function(y) { return [x].concat(y); }})
	.add('car',typeAbs('elt', arrow(list(tIdent('elt')), tIdent('elt'))), function(x) {
		if(x.length===0) {throw new Error('Cannot extract head of empty list');}
		return x[0];
	})
	.add('cdr',typeAbs('elt',arrow( list(tIdent('elt')), list(tIdent('elt')) )), function(x) {
		if(x.length===0) {throw new Error('Cannot extract tail of empty list');}
		return x.slice(1);
	})
	.add('empty',typeAbs('elt', list(tIdent('elt'))), [])
	;
    return {env:bld.env(),types:bld.types()};
};

var ensure = function(env) {
    return { bindings:{}, outer:env };//bind(env,'£ohoh','#nil');
};

var envTypes = stdlib()
  , _stdlib = envTypes.env
  , _stdtypes = envTypes.types;

module.exports = {
	typeExpr: typeExpr,
	erase: erase,
	eval: eval,
	stdLib: _stdlib,
	stdTypes: _stdtypes
}