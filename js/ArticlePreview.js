/*$
 * Author: Arthur Thornton
 * License: MIT Open Source
 * Source copyright Arthur Thornton
 */

/*********************************
* WOR.ArticlePreview kind based  *
*  off of the Control kind       *
*********************************/
enyo.kind({
	kind: enyo.Control,
	name: "WOR.ArticlePreview",
	/* use a Horizontal Flex layout */
	layoutKind: enyo.HFlexLayout,
	/* 150px tall */
	height: "150px",
	/* published properties */
	published: {
		index: 0,
		src: "",
		title: "",
		className: "",
		index: 0,
		category: "",
		modified: "",
		author: ""
	},
	/* events */
	events: {
		onArticleOpen: ""
	},
	/* overridden ready() method*/
	ready: function() {
		this.$.Hcaption.setContent(this.title);
		this.$.Himage.setSrc(this.src);
		this.$.Hmodified.setContent(this.modified);
		this.$.Hauthor.setContent(this.author);
		/* took this stuff out until a time in future when it can look better */
		/*this.$.Vcaption.setContent(this.title);
		this.$.Vimage.setSrc(this.src);*/
		
		
		/*switch(this.getOrientation()) {
			case 'portrait':
				this.$.VView.show();
				break;
			case "landscape":
				this.$.HView.show();
				break;
		}*/
	},
	/* overridden rendered() method */
	rendered: function() {
		this.hasNode();
		this.className = this.node.className;
		for (var e in this.events) {
			this.node[e] = enyo.bind(this, this[this.events[e]]); // register our events to the DOM
		}
		this.node.className = this.className + " ArticlePreview";
	},
	/* overridden destroy() method */
	destroy: function() {
		for (var e in this.node) {
			if (this.node && this.node[e])
				delete this.node[e]; // do garbage collection
		}
		this.inherited(arguments);
		this.destroyComponents();
		for (var n in this) {
			delete this[n];
		}
	},
	components: [
		/* featured image */
		{
			kind: enyo.Image,
			name: "Himage",
			style: "margin-right: 4px; border: 1px solid #000; background: #eee; width: 150px; height: 150px;",
			onclick: "openArticle"
		},
		/* article info */
		{
			kind: enyo.VFlexBox,
			onclick: "openArticle",
			flex: 1,
			components: [
				{ kind: enyo.Spacer },
				/* article name */
				{
					name: "Hcaption",
					flex: 3,
					className: "ArticlePreviewCaption"
				},
				{ kind: enyo.Spacer },
				/* posted info */
				{
					name: "Hmodified",
					className: "ArticlePreviewModified"
				},
				/* author */
				{
					name: "Hauthor",
					className: "ArticlePreviewModified"
				}
			]
		}
	],
	/* don't need this ... for now */
	/*
	getOrientation: function() {
		switch(enyo.getWindowOrientation()) {
			case 'left':
			case 'right': // WORKAROUND DUE TO webOS/Enyo BUG WHERE ORIENTATION IS MISMATCHED
				return "portrait";
				break;
			case undefined: // chrome
			case 'up':
			case 'down':
				return "landscape";
				break;
		}
	},*/
	classNameChanged: function() {
		this.hasNode();
		this.node.className = this.className + " ArticlePreview";
	},
	/* don't need this for now */
	resizeHandler: function() {
		/*switch(this.getOrientation()) {
			case 'portrait':
				this.$.VView.show();
				this.$.HView.hide();
				break;
			case "landscape":
				this.$.HView.show();
				this.$.VView.hide();
				break;
		}*/
	},
	/* send onArticleOpen event */
	openArticle: function() {
		this.doArticleOpen(this.category, this.index);
	}
});