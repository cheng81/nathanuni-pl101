
start = expression

_ = 
	space* (comment _)?
space = 
	' ' / [\t\n\r]
comment =
	';;' (![\r\n] c:.)*

expression =
	list / atom / quote

atom =
	chars:validchar+
	{ return chars.join(''); }
validchar = 
	[0-9a-zA-Z_?!+\-=@#$%^&*/.]


quote =
	"'" _ e:expression
	{ return ['quote',e]; }

list =
	'(' _ f:expression r:( _ e:expression {return e} )* _ ')' _
	{ return [f].concat(r); }