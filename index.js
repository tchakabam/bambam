Tone.Transport.bpm.value = 120;

function q(e, hash) {
	if (!hash) {
		hash = e;
		e = document;
	}
	return e.querySelector(hash);
}

function Thing() {

}

Thing.prototype = {
	constructor: Thing,

	attachView: function(view) {
		this.view = view;
		this.view.init(this);
		return this;
	},

	updateView: function() {
		this.view.update(this);
	}
}

function View(e) {
	this.e = e;
}

View.prototype = {
	constructor: View,
	init: function() {},
	update: function() {},
};

function Clip(component, length, beatFractionsPerStep, param) {

	this.loop = length;
	this.length = length;
	this.step = 0;
	this.param = param;

	this.component = component;

	Tone.Transport.setInterval(function(time) {

		console.log(param + ' > ' + time);

		this.step++;
		if (this.step > this.loop) {
			this.step = 1;
		}

		this.updateView();

		this.steps[this.step-1].trigger(time);

	}.bind(this), 4 * beatFractionsPerStep + "n");

	this.steps = [];
	for (var i=0;i<this.length;i++) {
		this.steps.push(new Step(i, this, param));
	}
};

Clip.prototype = _.create(Thing.prototype, {
	constructor: Clip,
	load: function() {
		Array.prototype.slice.call(arguments).forEach(function(value) {
			this.steps[value].setSelected(true);
		}.bind(this));
	}
});

function ClipView() {
	View.prototype.constructor.apply(this, arguments);
}

ClipView.prototype = _.create(View.prototype, {
	constructor: ClipView,

	init: function(clip) {
		var proto = q(this.e, '.step');
		clip.steps.forEach(function(step) {
			var stepElem = proto.cloneNode();
			stepElem.style.width = (100.0*(1/(clip.length + 6))) + '%';
			//this.e.style.width = '56em';
			this.e.appendChild(stepElem);
			step.attachView(new StepView(stepElem));
		}.bind(this));
		this.e.removeChild(proto);
	},

	update: function(clip) {

		var progress = (clip.step / clip.length)*100.0;

		q(this.e, '.past').style.width = progress + '%';
		q(this.e, '.future').style.width = (progress - 1) + '%';
	},

});

function Step(index, clip, param) {
	this.index = index;
	this.clip = clip;
	this.selected = false;
}

Step.prototype = _.create(Thing.prototype, {
	constructor: Step,
	trigger: function(time) {
		if (this.selected) {
			this.clip.component.triggerAttackRelease(this.clip.param, 0.1, time + 0.02);
		}
	},
	setSelected: function(selected) {
		this.selected = selected;
		this.updateView();
	}
});

function StepView() {
	View.prototype.constructor.apply(this, arguments);
}

StepView.prototype = _.create(View.prototype, {
	constructor: View,
	init: function(step) {
		this.e.onclick = function() {

			step.selected = !step.selected;

			this.update(step);
		}.bind(this);
	},
	update: function(step) {
		if (step.selected) {
			this.e.classList.add('selected')
		} else {
			this.e.classList.remove('selected');
		}
	}
});

function Transport(id, component, param) {
	this.id = id;
	this.clip = new Clip(component, 32, 4, param);
	this.onselected = function() {};
}

Transport.prototype = _.create(Thing.prototype, {
	constructor: Transport
});

function TransportView() {
	View.prototype.constructor.apply(this, arguments);
}

TransportView.prototype = _.create(View.prototype, {
	constructor: View,
	init: function(transport) {

		function makeLabelText(param) {
			param = param.length === 3 ? param : param + '_';
			param = '&nbsp;' + param + '&nbsp;';
			return param;
		}

		// get template elements
		var label = q('#label0').cloneNode(true);

		label.onclick = function() {
			label.classList.toggle('selected');
			transport.onselected();
		}

		var t = q('#t0').cloneNode(true);
		t.id = transport.id;
		label.id = 'label_' + transport.id;
		label.innerHTML = makeLabelText(transport.clip.param);

		var div = document.createElement('div');

		div.appendChild(label);
		div.appendChild(t);
		this.e.appendChild(div);
		transport.clip.attachView(new ClipView(t));
	}
});

function Main(component) {
	this.transports = [];
	this.transports.push(new Transport('t1', component, "C2"));
	this.transports.push(new Transport('t2', component, "C#2"));
	this.transports.push(new Transport('t2', component, "D2"));
	this.transports.push(new Transport('t2', component, "D#2"));
}

Main.prototype = _.create(Thing.prototype, {
	constructor: Main,
	setGlobalLoop: function(value) {
		this.transports.forEach(function(transport) {
			transport.clip.loop = value;
		});
	}
});

function MainView() {
	View.prototype.constructor.apply(this, arguments);
}

MainView.prototype = _.create(View.prototype, {
	constructor: MainView,
	init: function(main) {
		main.transports.forEach(function(transport) {
			transport.attachView(new TransportView(q('#transports')));
		}.bind(this));

		// clean-up template element
		q('#transports').removeChild(q('#t0'));
		q('#transports').removeChild(q('#label0'));
	}
});
