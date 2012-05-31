var clone = function(obj) {
	var out = {};
	for(var i in obj) {
		if(obj.hasOwnProperty(i)) {
			if(obj[i] instanceof Object) {
				out[i] = clone(obj[i]);
			} else {
				out[i] = obj[i];
			}
			
		}
	}
	return out;
};

var Turtle = function(raphael, w, h, t) {
	console.log('New Turtle');
	this.paper = raphael;//Raphael(container,w,h);
	this.originx = w/2;
	this.originy = h/2;
	this.state = [];
	this.clear();
	if(t!==undefined) {
		// console.log('Cloning state',t);
		this.state = [];
		for(var i=0; i<t.state.length; i++) {
			this.state[i] = clone(t.state[i]);
		}
		// console.log('Done Cloning!');
		this.updateTurtle();
	}
};
Turtle.prototype.clear = function() {
	// this.paper.clear();
	this.state = [{
		x: this.originx,
		y: this.originy,
		angle: 90,
		scale: 1,
		pen: true,
		stroke: {
			"stroke-width": 4,
			"stroke-linecap": 'round',
			"stroke-linejoin": 'round',
			"stroke": Raphael.rgb(0,0,0),
			"stroke-opacity": 1
		}
	}];
	//this.turtleimg = undefined;
	this.updateTurtle();
};
Turtle.prototype.top = function() {
	return this.state[0];
};
Turtle.prototype.push = function() {
	this.state.unshift(clone(this.state[0]));
};
Turtle.prototype.pop = function() {
	this.state.shift();
};
Turtle.prototype.updateTurtle = function() {
	if(this.turtleimg===undefined) {
		this.turtleimg = this.paper.image("../img/turtle2.png",0,0,64,64);
	}
	this.turtleimg.attr({
		x: this.top().x-32,
		y: this.top().y-32,
		transform: 'r' + (-this.top().angle)
	});
	this.turtleimg.toFront();
};
Turtle.prototype.drawTo = function(x,y) {
	var x1 = this.top().x
	  , y1 = this.top().y
	  , params = this.top().stroke;
	  // , aniparams = clone(this.top().stroke); //{ 'stroke-width': this.top().stroke.width };

	this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
		x1,y1,x,y)).attr(params);

	// var params = { "stroke-width": aniparams["stroke-width"], path:Raphael.format("M{0},{1}", x1, y1) };
	// aniparams.path = Raphael.format("M{0},{1}L{2},{3}", x1, y1, x, y);
	// var path = this.paper.path().attr(params);
	// var speed = Math.sqrt( (x1 - x) + (y1 - y) );
 //    path.animateWith(this.turtleimg, false, aniparams, speed, "linear");
};
Turtle.prototype.forward = function(d) {
	d *= this.top().scale;
	var newx = this.top().x + Math.cos(Raphael.rad(this.top().angle)) * d
	  , newy = this.top().y - Math.sin(Raphael.rad(this.top().angle)) * d;

	if(this.top().pen) {
		this.drawTo(newx,newy);
	}
	this.top().x = newx;
	this.top().y = newy;
	this.updateTurtle();
};
Turtle.prototype.right = function(ang) {
	this.top().angle -= ang;
	this.updateTurtle();
};
Turtle.prototype.left = function(ang) {
	this.top().angle += ang;
	this.updateTurtle();
};
Turtle.prototype.penUp = function() {
	this.top().pen = false;
};
Turtle.prototype.penDown = function() {
	this.top().pen = true;
};
Turtle.prototype.home = function() {
	this.top().x = this.originx;
	this.top().y = this.originy;
	this.updateTurtle();
};

Turtle.prototype.opacity = function(o) {
	this.top().stroke['stroke-opacity'] = o;
};
Turtle.prototype.colorRGB = function(r,g,b) {
	this.top().stroke.stroke = Raphael.rgb(r,g,b);
};
Turtle.prototype.stroke = function(w) {
	this.top().stroke['stroke-width'] = w;
};
Turtle.prototype.scale = function(s) {
	this.top().scale *= s;
};
Turtle.prototype.strokeScale = function(s) {
	this.top().stroke['stroke-width'] *= s;
};

module.exports.Turtle = Turtle;