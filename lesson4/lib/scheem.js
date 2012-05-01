var check = function(name,expr) {
    return {
        len: function(expected) {
            if(expr.length !== expected) {
                throw new Error('Expected a '+expected+' length for a '+name+' expression, but a '+expr.length+' was found');
            }
        },
        quote: function(pos) {
            var item = expr[pos];
            if(!item instanceof Array) {
                throw new Error('Expected quote in '+pos+'th position of a '+name+' expression, but a '+(typeof item)+' was found');
            }
            if('quote' !== item[0]) {
                throw new Error('Expected quote in '+pos+'th position of a '+name+' expression, but a '+(item[0])+' was found');
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
            chk.quote(2);
            return [evalScheem(expr[1], env)]
                .concat(evalScheem(expr[2], env));
        case 'car':
            chk.len(2);
            chk.quote(1);
            return (evalScheem(expr[1], env))[0];
        case 'cdr':
            chk.len(2);
            chk.quote(1);
            return (evalScheem(expr[1], env)).splice(1);
        case 'define':
        case 'set!':
            chk.len(2);
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