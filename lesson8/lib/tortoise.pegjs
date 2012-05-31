statements = _ stmts:statement* {return stmts;}

number_frac =
	"." chars:[0-9]*
	{ return "." + chars.join(''); }

number =
	minus:'-'? chars:[0-9]+ frac:number_frac?
	{ return parseFloat(minus + chars.join('') + frac); }

boolean =
	'true' {return true;}
	/ 'false' {return false;}

validfirstchar =
	[a-zA-Z_]

validchar =
	[0-9a-zA-Z_]

identifier =
	firstchar:validfirstchar chars:validchar*
	{ return firstchar + chars.join(''); }

_ = 
	space* (comment _)?
space = 
	' ' / [\t\n\r]
comment =
	'//' (![\n\r] c:.)* / '/*' (!'*/' c:.)+ '*/'

expression =
	expr:logical _ '?' _ ok:expression _ ':' _ ko:expression _
	{ return {tag:'inline-if',test:expr, left:ok, right:ko}; }
	/ expr:logical _
	{ return expr; }

logic_op = '&&' / '||'

logical =
	'!' _ expr:logical _
	{ return {tag:'not', expr:expr}; }
	/ left:comparative _ op:logic_op _ right:logical _
	{ return {tag:op, left:left, right: right}; }
	/ comparative

comp_op = "<=" / ">=" / "!=" / "==" / "<" / ">"

comparative =
	left:additive _ op:comp_op _ right:comparative _
	{ return {tag: op, left:left, right:right}; }
	/ additive

additive_op = "+" / "-"

additive
	= left:multiplicative _ op:additive_op _ right:additive _
	{ return {tag:op, left:left, right:right}; }
	/ multiplicative

mult_op = "*" / "/"

multiplicative =
	left:exponential _ op:mult_op _ right:multiplicative _
	{ return {tag:op, left:left, right:right}; }
	/ exponential

exp_op = '**' / '%'

exponential =
	left:primary _ op:exp_op _ right:exponential _
	{ return {tag:op, left:left, right:right}; }
	/ p:primary _
	{ return p; }

primary =
	number
	/ boolean
	/ 'spawn' _ v:identifier _ '(' _ ')'
	{ return {tag:'spawn', name:v, args:[]}; }
	/ 'spawn' _ v:identifier _ '(' _ args:arglist _ ')'
	{ return {tag:'spawn', name:v, args:args}; }
	/ 'throw' _ e:expression _
	{ return {tag:'throw', err:e}; }
	/ v:identifier _ "(" _ ")"
	{ return {tag:"call", name:v, args:[]}; }
	/ v:identifier _ "(" _ args:arglist _ ")"
	{ return {tag:"call", name:v, args:args}; }
	/ "(" _ expr:expression _ ")"
	{ return expr; }
	/ v:identifier
	{ return {tag:'ident',name:v}; }

comma_expression =
	"," _ expr:expression
	{ return expr; }

arglist =
	first:expression rest:comma_expression*
	{ return [first].concat(rest); }

statement =
	'yield' _ ';' _
		{ return { tag:'yield'}; }
	/ expr:expression _ ";" _
		{ return { tag:"ignore", body:expr }; }
	/ "with" _ '(' _ turtle:expression _ ')' _ '{' _ body:statements _ '}' _
		{ return {tag:'with', expr:turtle, body:body}; }
	/ "lock" _ '(' _ obj:identifier _ ')' _ '{' _ body:statements _ '}' _
		{ return {tag:'lock', lock:obj, body:body}; }
	/ 'try' _ '{' _ tbody:statements _ '}' _ 'catch' _ err:identifier _ '{' _ cbody:statements _ '}' _
		{ return {tag:'try', tryBody:tbody, errName:err, catchBody:cbody}; }
	/ v:identifier _ ":=" _ expr:expression ";" _
		{ return { tag:":=", left:v, right:expr }; }
    / 'var' _ name:identifier ';' _
    	{ return { tag:'var',name:name }; }
    / 'var' _ name:identifier _ ':=' _ expr:expression _ ';' _
    	{ return { tag:'var:=',left:name, right:expr }; }
    / 'if' _ '(' _ test:expression _ ')' _ '{' _ body:statements _ '}' _ elseb:( 'else' _ '{' _ eb:statements _ '}' _ {return eb;} )?
    	{ return { tag:'if',expr:test, body:body, elsebody:elseb }; }
    / 'repeat' _ '(' _ times:expression ')' _ '{' _ body:statements _ '}' _
    	{ return { tag:'repeat',expr:times,body:body }; }
	/ "define " _ v:identifier _  "(" _ ")" _ "{" _ body:statements _ "}" _
		{ return { tag:"define", name:v, args:[], body:body }; }
    / "define " _ v:identifier _ "(" _ args:ident_list _ ")" _ "{" _ body:statements _ "}" _
    	{ return { tag:"define", name:v, args:args, body:body }; }

comma_identifier = "," _ v:identifier { return v; }

ident_list =
	first:identifier rest:comma_identifier*
	{ return [first].concat(rest); }

