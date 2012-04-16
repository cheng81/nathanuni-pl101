{
	var definitions = {};
}

song =
	_ def* _ e:expr
	{ return {definitions:definitions,expr:e}; }

def = 
	'let' _ name:id _ '=' _ e:expr
	{ definitions[name] = e; }

note =
	p:pitch _ dur:integer _
	{ return {tag:'note',pitch:p,dur:dur}; }

expr = par

par = 
	left:seq _ '|' _ right:par _
	{ return {tag:'par',left:left,right:right}; }
	/ seq

seq =
	left:prim _ ',' _ right:seq _
	{ return {tag:'seq',left:left,right:right}; }
	/ prim

prim =
	note
	/ '_' _ dur:integer _ { return {tag:'rest',duration:dur}; }
	/ ref:id _ { return {tag:'ref',name:ref}; }
	/ '(' _ e:expr _ ')' _ { return e; }
	/ count:integer _ '*' _ section:expr
	{ return {tag:'repeat',count:count,section:section}; }

pitch =
	fst:[A-Ga-g] sharp:'#'? snd:[0-8] { return fst+sharp+snd; }

_ = 
	space* (comment _)?
space = 
	' ' / [\t\n\r]
comment =
	'//' (![\n\r] c:.)* / '/*' (!'*/' c:.)+ '*/'

integer =
	digits:[0-9]+ { return parseInt(digits.join(""), 10) }

id =
	fstchar:('_'/[a-zA-Z]) rest:(('_'/[a-zA-Z0-9])*) {var id = [fstchar].concat(rest).join(''); return id;}
