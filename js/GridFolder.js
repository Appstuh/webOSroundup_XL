/*$
 * Author: Arthur Thornton
 * License: MIT Open Source
 * Source copyright Arthur Thornton
 */

/****************************
* WOR.GridFolder kind based *
*  off of the Control kind  *
****************************/
enyo.kind({
	name: "WOR.GridFolder",
	kind: enyo.Control,
	className: "GridFolder",
	/* use a Vertical Flex layout */
	layoutKind: enyo.VFlexLayout,
	flex: 1,
	published: {
		currentView: ""
	},
	events: {
		onArticleClick: ""
	},
	components: [
		/* spacer */
		{ kind: enyo.Spacer, height: "53px" },
		/* HFlexBox that contains the Scroller */
		{
			kind: enyo.HFlexBox,
			components: [
				/* Spacer to have blank space on left */
				{ kind: enyo.Spacer, width: "6px", flex: 0 },
				/* Scroller for the article previews */
				{
					kind: enyo.Scroller,
					name: "carousel",
					height: "150px",
					flex: 1,
					className: "newsCarousel",
					vertical: false,
					components: [],
					showing: false
				},
				/* Spacer to have blank space on the right */
				{ kind: enyo.Spacer, width: "6px", flex: 0 }
			]
		},
		/* spacer to provide space on bottom */
		{ kind: enyo.Spacer, height: "53px" }
	],
	noTransitionTimeout: 0,
	/* overridden rendered() method to add custom DOM events */
	rendered: function() {
		this.hasNode();
		for (var e in this.events) {
			this.node[e] = this[this.events[e]]; // register our events to the DOM
		}
		this.defaultClasses = this.node.className + " GridFolder";
		this.node.className = this.defaultClasses;
	},
	/* overridden destroy() method to kill off custom DOM event handlers */
	destroy: function() {
		for (var e in this.node) {
			if (this.node && this.node[e])
				delete this.node[e]; // do garbage collection
		}
		this.destroyComponents();
		this.inherited(arguments);
	},
	/* method to close the GridFolder and destroy components in the scroller */
	close: function() {
		for (var n in this.owner.content) {
			if (this.$[n])
				this.$[n].destroy();
		}
		clearTimeout(this.noTransitionTimeout);
		this.node.style.webkitTransition = "height 0.5s linear";
		this.$.carousel.node.style.webkitTransition = "height 0.5s linear";
		this.$.carousel.node.className = "enyo-scroller newsCarousel closed";
		this.node.className = this.defaultClasses + " closed";
		this.noTransitionTimeout = setTimeout(enyo.bind(this, function() {
			this.node.style.webkitTransition = "";
			this.$.carousel.hide();
			this.$.carousel.node.className = "enyo-scroller newsCarousel open";
		}), 500);
	},
	/* method to open the GridFolder */
	open: function() {
		clearTimeout(this.noTransitionTimeout);
		this.node.style.webkitTransition = "height 0.5s linear";
		this.node.className = this.defaultClasses + " open";
		this.noTransitionTimeout = setTimeout(enyo.bind(this, function() {
			this.node.style.webkitTransition = "";
			this.$.carousel.show();
		}), 500);
	},
	/* method to show the view and create components for it */
	showView: function(viewName) {
		for (var n in this.owner.content) {
			if (this.$[n])
				this.$[n].destroy();
		}
		this.$.carousel.createComponent({
			kind: enyo.HFlexBox,
			name: viewName,
			className: "ArticlePreviewContainer",
			components: this.populateContent(viewName),
			height: "150px",
			showing: true
		}, {owner: this});
		this.$.carousel.scrollTo(0, 0);
		this.$[viewName].render();
	},
	/* returns an array of ArticlePreview components */
	populateContent: function(n) {
		var components = [];
		for (var j = 0; j < this.owner.content[n].length; j++) {
			components.push({
				kind: "WOR.ArticlePreview",
				title: this.owner.content[n][j].title,
				src: this.owner.content[n][j].src,
				category: n,
				index: j,
				onArticleOpen: "openArticle",
				modified: this.owner.content[n][j].postedAt,
				src: this.owner.content[n][j].src.match(/src="(.*)" class/i)[1],
				author: this.owner.content[n][j].author
			});
		}
		return components;
	},
	/* send an onArticleClick event */
	openArticle: function(inEvent, inCategory, inIndex) {
		this.doArticleClick(inCategory, inIndex);
	}
});