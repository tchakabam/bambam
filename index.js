Tone.Transport.bpm.value = 120;

function Thing() {

}

Thing.prototype = {
	constructor: Thing,

	attachView: function(view) {
		this.view = view;
		this.view.init(this);
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

function Clip(component, length, beatFractionsPerStep) {

	this.length = length;
	this.step = 0;

	this.component = component;

	Tone.Transport.setInterval(function(time){

		this.step++;

		if (this.step > this.length) {
			this.step = 1;
		}

		this.updateView();

		this.steps[this.step-1].trigger();

	}.bind(this), 4*beatFractionsPerStep + "n");

	this.steps = [];
	for (var i=0;i<this.length;i++) {
		this.steps.push(new Step(i, this.component));
	}
};

Clip.prototype = _.create(Thing.prototype, {
	constructor: Clip
});

function ClipView() {
	View.prototype.constructor.apply(this, arguments);
}

ClipView.prototype = _.create(View.prototype, {
	constructor: ClipView,

	init: function(clip) {
		var proto = this.e.querySelector('.step');
		clip.steps.forEach(function(step) {
			var stepElem = proto.cloneNode();
			stepElem.style.width = (100.0*(1/clip.length)) + '%';
			this.e.appendChild(stepElem);
			step.attachView(new StepView(stepElem));
		}.bind(this));
		this.e.removeChild(proto);
	},

	update: function(clip) {

		var progress = (clip.step / clip.length)*100.0;

		this.e.querySelector('.past').style.width = progress + '%';
		this.e.querySelector('.future').style.width = (progress - 1) + '%';
	},

});

function Step(index, component, param) {
	this.index = index;
	this.component = component;
	this.selected = false;
}

Step.prototype = _.create(Thing.prototype, {
	constructor: Step,
	trigger: function() {
		//console.log("trigger");
		if (this.selected) {
			this.component.triggerAttackRelease("C2", "1n");
		}
	},
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
			this.e.style.backgroundColor = 'white';
		} else {
			this.e.style.backgroundColor = 'blue';
		}
	}
});