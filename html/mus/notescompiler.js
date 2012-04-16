; (function (window) {

/*Convert the pitch to the jsmidi format*/
var convert = function(pitch) {
	var sharp = pitch.length === 3;
	var c = '';
	if(sharp) {
		c = pitch[0].toUpperCase() + 'b' + pitch[2];
	} else {
		c = pitch[0].toUpperCase() + pitch[1];
	}
	var out = noteTable[c];
	if(out === undefined) {
		throw new Error('Non existent pitch: '+pitch+' - '+c);
	}
	return out;
};

/*Convert notes format to a lower level one,
more amenable for MIDI creation*/
var lowlevel = function(notes) {
	var out = [];
	for (var i = 0; i < notes.length; i++) {
		var note = notes[i];
		var pitch = convert(note.pitch);

		//For each note, create two events on/off
		out.push({on:true,pitch:pitch,time:note.start});
		out.push({on:false,pitch:pitch,time:note.start+note.dur});
	};

	//Sort all the on/off events on time
	out.sort(function(a,b) {return a.time-b.time;});

	//And creates a "delta" time between an event and its predecessor
	for (var i = out.length - 1; i >= 1; i--) {
		out[i].delta = out[i].time - out[i-1].time;
	};
	return out;
};

/*Track compilation. Input is a Notes program - a sequence of notes*/
var compileTrack = function(notes) {
	var events = [];
	var llnotes = lowlevel(notes);
	var accum = 0;
	for (var i = 0; i < llnotes.length; i++) {
		var note = llnotes[i];
		var event = 
			(note.on===true) ?
				MidiEvent.noteOn(note.pitch,note.delta) :
				MidiEvent.noteOff(note.pitch,note.delta);
		events.push( event );
	};
	return new MidiTrack( {
		// tempo: 120,	//for some reason, setting the tempo breaks jasmid
		events: events
	} );
};
var compile = window.notesToMidi = function(notes) {
	var track = compileTrack(notes);
	return new MidiWriter({
		tracks: [track]
	})
};

})(this);