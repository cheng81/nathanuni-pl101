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
	/ expr:logical
	{ return expr; }

logic_op = '&&' / '||'

logical =
	'!' _ expr:logical
	{ return {tag:'not', expr:expr}; }
	/ left:comparative _ op:logic_op _ right:logical
	{ return {tag:op, left:left, right: right}; }
	/ comparative

comp_op = "<=" / ">=" / "!=" / "==" / "<" / ">"

comparative =
	left:additive _ op:comp_op _ right:comparative
	{ return {tag: op, left:left, right:right}; }
	/ additive

additive_op = "+" / "-"

additive
	= left:multiplicative _ op:additive_op _ right:additive
	{ return {tag:op, left:left, right:right}; }
	/ multiplicative

mult_op = "*" / "/"

multiplicative =
	left:exponential _ op:mult_op _ right:multiplicative
	{ return {tag:op, left:left, right:right}; }
	/ exponential

exp_op = '**' / '%'

exponential =
	left:primary _ op:exp_op _ right:exponential
	{ return {tag:op, left:left, right:right}; }
	/ primary

primary =
	number
	/ boolean
//	/ test:logical _ '?' _ ok:expression _ ':' _ ko:expression _
//	{ return {tag:'inline-if',test:test, left:ok, right:ko}; }
	/ v:identifier "(" _ ")"
	{ return {tag:"call", name:v, args:[]}; }
	/ v:identifier "(" _ args:arglist _ ")"
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
	expr:expression _ ";" _
		{ return { tag:"ignore", body:expr }; }
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

