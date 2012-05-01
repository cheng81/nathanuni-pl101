var check = function(name,expr) {
    return {
        len: function(expected) {
            if(expr.length !== expected) {
                throw new Error(name + ' expressions take '+expected+' parameters, but '+expr.length+' parameters were given');
            }
        },
        arr: function(val) {
            if(!(val instanceof Array)) {
                throw new Error('List expected, but '+(typeof val)+' found');
            }
        }
    };
};
var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    if (typeof expr === 'string') {
        return env[expr];
    }
    // Look at head of list for operation
    var chk = check(expr[0],expr);
    switch (expr[0]) {
        case '+':
            chk.len(3);
            return evalScheem(expr[1], env) +
                   evalScheem(expr[2], env);
        case '-':
            chk.len(3);
            return evalScheem(expr[1], env) - 
                    evalScheem(expr[2], env);
        case '*':
            chk.len(3);
            return evalScheem(expr[1], env) * 
                    evalScheem(expr[2], env);
        case '/':
            chk.len(3);
            return evalScheem(expr[1], env) / 
                    evalScheem(expr[2], env);
        case 'quote':
            chk.len(2);
            return expr[1];
        case '=':
            chk.len(3);
            var eq = (evalScheem(expr[1], env) ===
                    (evalScheem(expr[2], env)));
            return eq ? '#t' : '#f';
        case '<':
            chk.len(3);
            var lt = (evalScheem(expr[1], env) < evalScheem(expr[2], env));
            return lt ? '#t' : '#f';
        case 'if':
            chk.len(4);
            return (evalScheem(expr[1], env) === '#t') ?
                evalScheem(expr[2], env) :
                evalScheem(expr[3], env);
        case 'cons':
            chk.len(3);
            var arr = evalScheem(expr[2], env);
            chk.arr(arr);
            return [evalScheem(expr[1], env)]
                .concat(arr);
        case 'car':
            chk.len(2);
            var arr = evalScheem(expr[1], env);
            chk.arr(arr);
            return arr[0];
        case 'cdr':
            chk.len(2);
            var arr = evalScheem(expr[1], env);
            chk.arr(arr);
            return arr.splice(1);
        case 'define':
            chk.len(3);
            if(env[expr[1]] !== undefined) {
                throw new Error(expr[1] + ' already defined');
            }
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;
        case 'set!':
            if(env[expr[1]] === undefined) {
                throw new Error('Undefined '+expr[1]+' variable');
            }
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;
        case 'begin':
            var res = 0;
            for (var i = 1; i < expr.length; i++) {
                res = evalScheem(expr[i], env);
            };
            return res;
    }
};

module.exports.evalScheem = evalScheem;