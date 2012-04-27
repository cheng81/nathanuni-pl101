
start = expression

_ = 
	space* (comment _)?
space = 
	' ' / [\t\n\r]
comment =
	';;' (![\r\n] c:.)*

expression =
	_ e:(list / atom / quote) _ { return e }

atom =
	chars:validchar+
	{ return chars.join(''); }
validchar = 
	[0-9a-zA-Z_?!+\-=@#$%^&*/.]


quote =
	"'" e:expression
	{ return ['quote',e]; }

list =
	'(' es:expression* ')'
	{ return es; }