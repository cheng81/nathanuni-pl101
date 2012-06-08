
start = expression

_ = 
	space* (comment _)?
space = 
	' ' / [\t\n\r]
comment =
	';;' (![\r\n] c:.)*

typed = '<' _ first:type rest:( _ t:type {return t})* _ '>' _
	{ return [first].concat(rest); }

expression =
	_ e:(typeabs / type / list / atom / quote)
	_ t:typed?
	{ return t==='' ? e : ['tapp',e,t]; }

typeabs =
	'{' _ '(' _ t:ids _ ')' _ tbody:type? _ body:expression _ '}'
	{ return ['tabs',t,tbody,body]; }

type
	= '(' _ left:type _ '->' _ right:type _ ')'
		{ return {tag:'arrowtype', left:left, right:right}; }
	/ '[' _ t:type _ ']'
		{ return {tag:'listtype', type:t}; }
	/ base:('num'/'bool'/'unit'/'sym')
		{ return {tag:'basetype', name:base}; }
	/ ':' _ i:typeid
		{ return {tag:'identtype', name:i}; }

ids =
	first:ident rest:(_ i:ident {return i;})*
	{ return [first].concat(rest); }

typeid = chars:[a-zA-Z]+ {return chars.join('');}
atom 
	= integer
	/ ident

ident =
	chars:validchar+
	{ return chars.join(''); }

validchar = 
	[0-9a-zA-Z_?!+\-=@#$%^&|*/.>] / !( _ typed) '<' {return '<';}

integer =
	minus:'-'? digits:[0-9]+ {
	var num = parseInt(digits.join(""), 10);
	return (minus==='-') ? (-num) : num;
	}

quote =
	"'" e:expression
	{ return ['quote',e]; }

list =
	'(' es:expression* ')'
	{ return es.length > 0 ? es : []; }