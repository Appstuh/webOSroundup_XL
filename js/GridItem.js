/*$
 * Author: Arthur Thornton
 * License: MIT Open Source
 * Source copyright Arthur Thornton
 */

/***************************
* WOR.GridItem kind based  *
*  off of the Control kind *
***************************/
enyo.kind({
	name: "WOR.GridItem",
	kind: enyo.Control,
	/* width and height */
	width: "128px",
	height: "128px",
	active: false,
	defaultClasses: "",
	published: {
		imageSrc: "",
		caption: ""
	},
	/* events */
	events: {
		"onclick": "clicked"
	},
	/* use a Vertical Flex layout */
	layoutKind: enyo.VFlexLayout,
	flex: 1,
	/* overridden rendered() method to add event handlers */
	rendered: function() {
		this.hasNode();
		for (var e in this.events) {
			this.node[e] = enyo.bind(this, this[this.events[e]]); // register our events to the DOM
		}
		this.defaultClasses = this.node.className;
	},
	/* overridden destroy() method */
	destroy: function() {
		this.inherited(arguments);
		for (var e in this.node) {
			if (this.node && this.node[e])
				delete this.node[e]; // do garbage collection
		}
		this.destroyComponents();
		for (n in this) {
			delete this[n];
		}
	},
	components: [
		{kind: enyo.Spacer}, /* Spacer */
		/*HFlexBox for the Image */
		{
			kind: enyo.HFlexBox,
			components: [
				{kind: enyo.Spacer}, /* Spacer */
				{
					kind: enyo.Image,
					name: "icon"
				},
				{kind: enyo.Spacer} /* Spacer */
			]
		},
		/* HFlexBox for the caption */
		{
			kind: enyo.HFlexBox,
			components: [
				{kind: enyo.Spacer}, /* Spacer */
				{
					name: "caption",
					className: "GridItemCaption"
				},
				{kind: enyo.Spacer} /* Spacer */
			]
		},
		{kind: enyo.Spacer} /* Spacer */
	],
	/* overridden ready method to set image source and caption */
	ready: function() {
		this.inherited(arguments);
		this.$.icon.setSrc(this.imageSrc);
		this.$.caption.setContent(this.caption);
	},
	markActive: function() {
		this.node.className = this.defaultClasses + " active";
	},
	markDeactive: function() {
		this.node.className = this.defaultClasses;
	}
});