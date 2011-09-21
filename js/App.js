/*$
 * Author: Arthur Thornton
 * License: MIT Open Source
 * Source copyright Arthur Thornton
 */

/***************************
* WOR.App kind based off   *
*  of the VFlexBox kind    *
***************************/
enyo.kind({
	kind: enyo.VFlexBox,
	name: "WOR.App",
	GridFolderOpen: false,
	captcha: 0,
	ready: function() {
		this.inherited(arguments);
		this.resetOrientationClass();
		for (var i = 0; i < this.categories.length; i++) {
			this.$.getContent.call({
				category: parseInt(this.categories[i], 10),
				posts: 20,
				brief: 1
			});
		}
		this.$.pane.selectView(this.$.mainView);
	},
	openAboutPopup: function() {
		this.$.aboutPopup.openAtCenter();
	},
	components: [
		/* WebService to get articles from WOR */
		{
			kind: enyo.WebService,
			url: "http://www.webosroundup.com/ajax.php",
			onSuccess: "gotContent",
			onFailure: "gotContentFailure",
			name: "getContent"
		},
		/* WebService to shorten URLS with bit.ly */
		{
			kind: enyo.WebService,
			url: "http://api.bitly.com/v3/shorten",
			name: "shortenURL"
		},
		/* WebService to get the Disqus thread ID */
		{
			kind: enyo.WebService,
			url: "http://disqus.com/api/get_thread_by_url",
			onSuccess: "gotDisqusThread",
			name: "getDisqusThread"
		},
		/* WebService to get Disqus comments */
		{
			kind: enyo.WebService,
			url: "http://disqus.com/api/get_thread_posts",
			onSuccess: "gotComments",
			name: "getComments"
		},
		/* WebService to add a Disqus comment */
		{
			kind: enyo.WebService,
			url: "http://disqus.com/api/create_post",
			onSuccess: "sentComment",
			onFailure: "failedToSendComment",
			name: "postComment",
			method: "POST"
		},
		/* PalmService to open a URL */
		{
			kind: enyo.PalmService,
			name: "openURL",
			service: "palm://com.palm.applicationManager/",
			method: "open"
		},
		/* PalmService to launch an app */
		{
			kind: enyo.PalmService,
			name: "appMgr",
			service: "palm://com.palm.applicationManager/",
			method: "launch"
		},
		/* WebService to get the Captcha image */
		{
			kind: enyo.WebService,
			name: "getCaptcha",
			url: "http://www.webosroundup.com/tips/",
			onSuccess: "gotCaptcha"
		},
		/* WebService to post a comment */
		{
			kind: enyo.WebService,
			name: "sendTipWebService",
			url: "http://www.webosroundup.com/tips/",
			method: "post",
			onSuccess: "tipSentHandler",
			onFailure: "tipSentHandler"
		},
		/* ApplicationEvents kind to receive application events */
		{
			kind: enyo.ApplicationEvents,
			onWindowRotated: "resetOrientationClass"
		},
		/* AppMenu */
		{
			kind: enyo.AppMenu,
			components: [
				{
					content: "About",
					onclick: "openAboutPopup"
				}
			]
		},
		/* About This App popup */
		{
			kind: enyo.Popup,
			name: "aboutPopup",
			width: "480px",
			lazy: true,
			layoutKind: enyo.VFlexLayout,
			components: [
				{
					content: "About this App",
					className: "enyo-item enyo-first",
					style: "font-size: 1.25em"
				},
				/* basic description */
				{
					className: "enyo-item",
					content: "webOSroundup XL is your go-to application to access webOSroundup news from the TouchPad.",
					style: "font-size: 0.8em"
				},
				{
					kind: enyo.HFlexBox,
					className: "enyo-item",
					components: [
						{
							content: "Version:",
							flex: 2,
							style: "font-size: 0.8em"
						},
						/* Version is auto-filled from the appinfo.json file */
						{
							content: enyo.fetchAppInfo().version,
							style: "font-size: 0.8em",
							flex: 6
						}
					]
				},
				{
					kind: enyo.HFlexBox,
					className: "enyo-item",
					components: [
						{
							content: "Developer:",
							flex: 2,
							style: "font-size: 0.8em"
						},
						{
							content: "Arthur Thornton (Appstuh)",
							style: "font-size: 0.8em",
							flex: 6
						}
					]
				},
				{
					kind: enyo.HFlexBox,
					className: "enyo-item enyo-last",
					components: [
						{
							content: "Background:",
							flex: 2,
							style: "font-size: 0.8em"
						},
						{
							content: "Originally from NASA",
							style: "font-size: 0.8em",
							flex: 6
						}
					]
				}
			]
		},
		/* Popup to show when there are errors with getting the feed */
		{
			kind: enyo.Popup,
			name: "errorWithFeedsPopup",
			lazy: true,
			width: "480px",
			height: "320px",
			components: [
				{
					content: "Error",
					className: "enyo-item enyo-first",
					style: "font-size: 1.25em; color: #FF3232"
				},
				{
					className: "enyo-item enyo-last",
					content: "There was an error while retrieving one or more of the webOSroundup feeds. If the category you wish to view is missing articles, reload the app and try again.",
					style: "font-size: 0.8em"
				}
			]
		},
		/* Pane kind for the app */
		{
			kind: enyo.Pane,
			flex: 1,
			components: [
				/* the main view, a VFlexBox */
				{
					kind: enyo.VFlexBox,
					name: "mainView",
					flex: 1,
					components: [
						/* Scrim to show when loading the app content */
						{
							kind: enyo.Scrim,
							layoutKind: enyo.VFlexLayout,
							components: [
								{ kind: enyo.Spacer },
								{
									kind: enyo.HFlexBox,
									components: [
										{ kind: enyo.Spacer },
										{
											kind: enyo.SpinnerLarge,
											showing: true
										},
										{ kind: enyo.Spacer }
									]
								},
								{
									kind: enyo.HFlexBox,
									components: [
										{ kind: enyo.Spacer },
										{
											content: "Downloading webOSroundup articles...",
											style: "color: #fff"
										},
										{ kind: enyo.Spacer }
									]
								},
								{ kind: enyo.Spacer }
							],
							showing: true
						},
						/* Popup for tips .. lazy=true to it doesn't render to DOM until we need it */
						{
							kind: enyo.ModalDialog,
							name: "tipUsPopup",
							layoutKind: enyo.VFlexLayout,
							width: "480px",
							lazy: true,
							components: [
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.VFlexBox,
											flex: 2,
											components: [
												{ kind: enyo.Spacer },
												{
													content: "Your Name:"
												},
												{ kind: enyo.Spacer }
											]
										},
										{
											kind: enyo.Input,
											hint: "Required but can be Anonymous",
											name: "tipUs_name",
											flex: 5,
											components: [
												{
													kind: enyo.Image,
													src: "images/icon-warning.png",
													name: "tipUs_name_warning",
													showing: false
												}
											]
										}
									]
								},
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.VFlexBox,
											flex: 2,
											components: [
												{ kind: enyo.Spacer },
												{
													content: "Your email:"
												},
												{ kind: enyo.Spacer }
											]
										},
										{
											kind: enyo.Input,
											inputType: "email",
											name: "tipUs_email",
											autoCapitalize: "lowercase",
											hint: "Required",
											flex: 5,
											components: [
												{
													kind: enyo.Image,
													src: "images/icon-warning.png",
													name: "tipUs_email_warning",
													showing: false
												}
											]
										}
									]
								},
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.VFlexBox,
											flex: 2,
											components: [
												{ kind: enyo.Spacer },
												{
													content: "Your tip:"
												},
												{ kind: enyo.Spacer }
											]
										},
										{
											kind: enyo.RichText,
											multiline: true,
											name: "tipUs_tip",
											hint: "Required",
											flex: 5,
											components: [
												{
													kind: enyo.Image,
													src: "images/icon-warning.png",
													name: "tipUs_tip_warning",
													showing: false
												}
											]
										}
									]
								},
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.VFlexBox,
											flex: 2,
											components: [
												{ kind: enyo.Spacer },
												{
													content: "Captcha:"
												},
												{ kind: enyo.Spacer }
											]
										},
										{
											kind: enyo.Input,
											name: "tipUs_captcha",
											hint: "Enter text from image",
											flex: 3,
											components: [
												{
													kind: enyo.Image,
													src: "images/icon-warning.png",
													name: "tipUs_captcha_warning",
													showing: false
												}
											]
										},
										{
											kind: enyo.VFlexBox,
											flex: 2,
											components: [
												{ kind: enyo.Spacer },
												{
													kind: enyo.Image,
													name: "tipUs_captchaImage",
													src: ""
												},
												{ kind: enyo.Spacer }
											]
										}
									]
								},
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.Button,
											flex: 1,
											caption: "Cancel",
											onclick: "tipUs_close"
										},
										{
											kind: enyo.Button,
											flex: 1,
											className: "enyo-button-affirmative",
											caption: "Send Tip",
											onclick: "tipUs_send"
										}
									]
								}
							]
						},
						/* VFlexBox containing the WOR logo, grid, and the "folder" */
						{
							kind: enyo.VFlexBox,
							flex: 1,
							components: [
								{ kind: enyo.Spacer },
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.Spacer
										},
										{
											kind: enyo.Image,
											align: "center",
											src: "WOR-logo.png"
										},
										{
											kind: enyo.Spacer
										}
									]
								},
								{ kind: enyo.Spacer },
								{
									kind: enyo.HFlexBox,
									components: [
										{ kind: enyo.Spacer },
										{
											kind: enyo.Grid,
											name: "WOR_Grid",
											cellClass: "viewable",
											components: [
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-news.png",
													caption: "News",
													onclick: "openNews",
													name: "gridItem_news"
												},
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-appreviews.png",
													caption: "App Reviews",
													onclick: "openNews",
													name: "gridItem_reviews"
												},
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-prenotes.png",
													caption: "preNotes",
													onclick: "openNews",
													name: "gridItem_prenotes"
												},
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-meetups.png",
													caption: "Meetups",
													onclick: "openNews",
													name: "gridItem_meetups"
												},
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-webosradio.png",
													caption: "webOSRadio",
													onclick: "openNews",
													name: "gridItem_podcasts"
												},
												{
													kind: "WOR.GridFolder",
													name: "GridFolder",
													onArticleClick: "openArticle"
												},
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-aod.png",
													caption: "App of the Day",
													onclick: "openNews",
													name: "gridItem_aod"
												},
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-tipstricks.png",
													caption: "Tips & Tricks",
													onclick: "openNews",
													name: "gridItem_tips"
												},
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-promoroundup.png",
													caption: "Promo Codes",
													onclick: "openNews",
													name: "gridItem_promocodes"
												},
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-generic.png",
													caption: "Forums",
													onclick: "openForums"
												},
												{
													kind: "WOR.GridItem",
													imageSrc: "images/icon-generic.png",
													caption: "Tip Us",
													onclick: "openTipUs"
												}
											]
										},
										{ kind: enyo.Spacer },
									]
								},
								{ kind: enyo.Spacer }
							]
						}
					]
				},
				/* Article View VFlexBox */
				{
					kind: enyo.VFlexBox,
					name: "articleView",
					flex: 1,
					lazy: true,
					components: [
						/* Popup to add a comment */
						{
							kind: enyo.ModalDialog,
							name: "addCommentPopup",
							layoutKind: enyo.VFlexLayout,
							width: "480px",
							lazy: true,
							components: [
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.VFlexBox,
											flex: 2,
											components: [
												{ kind: enyo.Spacer },
												{
													content: "Your Name:"
												},
												{ kind: enyo.Spacer }
											]
										},
										{
											kind: enyo.Input,
											hint: "Required, shown, can be Anonymous",
											name: "comment_name",
											flex: 5,
											components: [
												{
													kind: enyo.Image,
													src: "images/icon-warning.png",
													name: "comment_name_warning",
													showing: false
												}
											]
										}
									]
								},
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.VFlexBox,
											flex: 2,
											components: [
												{ kind: enyo.Spacer },
												{
													content: "Your email:"
												},
												{ kind: enyo.Spacer }
											]
										},
										{
											kind: enyo.Input,
											inputType: "email",
											name: "comment_email",
											hint: "Required, not shown",
											flex: 5,
											components: [
												{
													kind: enyo.Image,
													src: "images/icon-warning.png",
													name: "comment_email_warning",
													showing: false
												}
											]
										}
									]
								},
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.RichText,
											multiline: true,
											name: "comment_comment",
											hint: "Your Comment",
											flex: 1,
											components: [
												{
													kind: enyo.Image,
													src: "images/icon-warning.png",
													name: "comment_comment_warning",
													showing: false
												}
											]
										}
									]
								},
								{
									name: "comment_popup_failed",
									showing: false,
									style: "color: #FF3232; font-size: 0.82em",
									content: "There was an error sending your comment. Please try again."
								},
								{
									kind: enyo.HFlexBox,
									components: [
										{
											kind: enyo.Button,
											flex: 1,
											caption: "Cancel",
											onclick: "comment_close"
										},
										{
											kind: enyo.Button,
											flex: 1,
											className: "enyo-button-affirmative",
											caption: "Post Comment",
											onclick: "comment_post"
										}
									]
								}
							]
						},
						/* HFlexBox for the main content in the Article View ... left side for article, right for comments */
						{
							kind: enyo.HFlexBox,
							flex: 1,
							components: [
								{
									layoutKind: enyo.VFlexLayout,
									style: "border-right: 1px solid #000",
									flex: 3,
									components: [
										{
											kind: enyo.PageHeader,
											components: [
												{
													name: "articleTitle",
													style: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap;",
													flex: 1
												}
											]
										},
										{
											kind: enyo.Scroller,
											name: "articleContentScroller",
											horizontal: false,
											vertical: true,
											style: "background: rgba(204, 204, 204, 0.8)",
											flex: 1,
											components: [
												{
													name: "articleContent",
													allowHtml: true,
													className: "articleContent",
													rendered: function() {
														this.hasNode();
														var imgs = this.node.getElementsByTagName("img");
														for (var i = 0; i < imgs.length; i++) {
															if (imgs[i].parentNode.tagName == "A") {
																imgs[i].parentNode.href = "javascript:void('blah')";
															}
														}
													},
													flex: 1
												}
											]
										},
										{
											kind: enyo.Toolbar,
											components: [
												{
													kind: enyo.Button,
													caption: "Back",
													onclick: "goBack"
												},
												{ kind: enyo.Spacer },
												{
													kind: enyo.Button,
													caption: "Share",
													onclick: "openSharePopup" /* opens the popup selector below */
												},
												{ kind: enyo.Spacer }
											]
										}
									]
								},
								{
									layoutKind: enyo.VFlexLayout,
									style: "border-left: none",
									components: [
										{
											kind: enyo.PageHeader,
											components: [
												{content: "Comments"}
											]
										},
										{
											kind: enyo.Scroller,
											name: "commentsScroller",
											horizontal: false,
											vertical: true,
											style: "background: rgba(204, 204, 204, 0.8)",
											flex: 1,
											components: [
												{
													kind: enyo.VirtualRepeater,
													name: "commentsList",
													onSetupRow: "loadComments",
													components: [
														{
															kind: enyo.Item,
															name: "commentsListItem",
															layoutKind: enyo.VFlexLayout,
															components: [
																{
																	kind: enyo.HFlexBox,
																	className: "commentAuthorAndAvatar",
																	style: "padding-bottom: 0; margin-bottom: 0",
																	components: [
																		{
																			kind: enyo.Image,
																			name: "commentsListItemAvatar",
																			className: "commentsListItemAvatar"
																		},
																		{
																			kind: enyo.VFlexBox,
																			height: "32px",
																			flex: 1,
																			components: [
																				{ kind: enyo.Spacer, flex: 1 },
																				{
																					name: "commentsListItemAuthor",
																					className: "microText",
																					flex: 1
																				},
																				{ kind: enyo.Spacer, flex: 1 }
																			]
																		}
																	]
																},
																{
																	name: "commentsListItemText",
																	className: "smallText",
																	allowHtml: true,
																	style: "overflow: auto;"
																}
															]
														}
													]
												}
											]
										},
										{
											kind: enyo.Toolbar,
											components: [
												{ kind: enyo.Spacer },
												{
													icon: "images/menu-icon-new.png",
													onclick: "addComment"
												}
											]
										}
									],
									flex: 2
								}
							]
						}
					]
				}
			]
		},
		/* "Share Article via" ... selector */
		{
			kind: enyo.PopupSelect,
			lazy: true,
			name: "shareArticleMenu",
			onSelect: "shareArticle",
			items: [
				{
					caption: "Facebook",
					value: "Facebook"
				},
				{
					caption: "Spaz HD",
					value: "Twitter"
				}
			]
		}
	],
	/* open the articles "folder" or open the folder to the proper view */
	openNews: function(inSender, inEvent) {
		var openedItem = inEvent.dispatchTarget.owner.name.replace("gridItem_", "");
		if (this.GridFolderOpen && this.currentlyOpened == openedItem) {
			this.$.GridFolder.close();
			this.currentlyOpened = "";
			this.GridFolderOpen = !this.GridFolderOpen;
			return;
		}
		this.$.GridFolder.showView(openedItem);
		this.currentlyOpened = openedItem;
		if (!this.GridFolderOpen) {
			this.$.GridFolder.open();
		}
		this.GridFolderOpen = !this.GridFolderOpen;
	},
	/* handle the device orientation change so things can be resized properly */
	resetOrientationClass: function() {
		var orientation;
		switch(enyo.getWindowOrientation()) {
			case 'left':
			case 'right': // WORKAROUND DUE TO webOS/Enyo BUG WHERE ORIENTATION IS MISMATCHED
				orientation = "portrait";
				break;
			case undefined: // chrome
			case 'up':
			case 'down':
				orientation = "landscape";
				break;
		}
		document.body.className = orientation;
	},
	/* open the forums in the browser */
	openForums: function() {
		this.$.openURL.call({
			target: "http://forums.webosroundup.com"
		});
	},
	/* open the "tip us" popup */
	openTipUs: function() {
		this.$.getCaptcha.call();
		this.$.tipUsPopup.openAtCenter();
	},
	/* get the captcha image */
	gotCaptcha: function(inRequest, inResponse) {
		var captcha = inResponse.match(/http:\/\/www.webosroundup.com\/wp-content\/uploads\/wpcf7_captcha\/(\d+)\.png/);
		this.$.tipUs_captchaImage.setSrc(captcha[0]);
		this.captcha = captcha[1];
	},
	/* close the tip us popup and set values to empty */
	tipUs_close: function() {
		this.$.tipUsPopup.close();
		this.$.tipUs_name.setValue("");
		this.$.tipUs_email.setValue("");
		this.$.tipUs_tip.setValue("");
		this.$.tipUs_captcha.setValue("");
		this.$.tipUs_name_warning.hide();
		this.$.tipUs_email_warning.hide();
		this.$.tipUs_tip_warning.hide();
		this.$.tipUs_captcha_warning.hide();
		this.$.tipUs_captchaImage.setSrc("");
	},
	/* send tip */
	tipUs_send: function() {
		var missing = false;
		if (this.$.tipUs_name.getValue().length == 0) {
			missing = true;
			this.$.tipUs_name_warning.show();
		} else {
			this.$.tipUs_name_warning.hide();
		}
		if (this.$.tipUs_email.getValue().length == 0) {
			missing = true;
			this.$.tipUs_email_warning.show();
		} else {
			this.$.tipUs_email_warning.hide();
		}
		if (this.$.tipUs_tip.getValue().length == 0) {
			missing = true;
			this.$.tipUs_tip_warning.show();
		} else {
			this.$.tipUs_tip_warning.hide();
		}
		if (this.$.tipUs_captcha.getValue().length == 0) {
			missing = true;
			this.$.tipUs_captcha_warning.show();
		} else {
			this.$.tipUs_captcha_warning.hide();
		}
		if (missing === false) {
			/* if all fields have content, make the WebService call */
			this.$.sendTipWebService.call({
				_wpcf7: 3,
				_wpcf7_version: "2.4.6",
				_wpcf7_unit_tag: "wpcf7-f3-p5263-o1",
				"your-name": this.$.tipUs_name.getValue(),
				"your-email": this.$.tipUs_email.getValue(),
				"your-message": this.$.tipUs_tip.getValue(),
				"_wpcf7_captcha_challenge_captcha-106": this.captcha,
				"captcha-106": this.$.tipUs_captcha.getValue(),
				_wpcf7_is_ajax_call: 1
			});
		}
	},
	/* onSuccess handler for sending tips */
	tipSentHandler: function(inSender, inResponse, inRequest) {
		/* remove the <textarea> tags... THIS IS JSON! */
		inResponse = JSON.parse(inResponse.replace("<textarea>", "").replace("</textarea>", ""));
		if (inResponse.mailSent == false) {
			/* the tip wasn't sent ... figure out why and show a warning icon */
			for(var i = 0; i < inResponse.invalids.length; i++) {
				if (inResponse.invalids[i].into.match("name")) {
					this.$.tipUs_name_warning.show();
				}
				if (inResponse.invalids[i].into.match("email")) {
					this.$.tipUs_email_warning.show();
				}
				if (inResponse.invalids[i].into.match("message")) {
					this.$.tipUs_tip_warning.show();
				}
			}
			/* and now we have to have a new captcha because that's how it works ... */
			this.$.tipUs_captcha_warning.show();
			this.$.tipUs_captcha.setValue("");
			this.$.tipUs_captchaImage.setSrc("");
			this.$.getCaptcha.call();
		} else {
			/* tip sent, close the popup */
			this.tipUs_close();
		}
	},
	/* article categories .. the IDs anyhow */
	categories: [
		1, // news
		31, // reviews
		131, // tips
		458, // podcasts
		859, // app of day
		898, // prenotes
		1241, // promo roundup
		1489 // meetups
	],
	/* article category names */
	categoriesByName: [
		"news",
		"reviews",
		"tips",
		"podcasts",
		"aod",
		"prenotes",
		"promocodes",
		"meetups"
	],
	/* onSuccess handler for the article retrieval WebService */
	gotContent: function(inSender, inResponse, inRequest) {
		var category = this.categoriesByName[this.categories.indexOf(inRequest.params.category)];
		this.content[category] = [];
		for (var i = 0; i < inResponse.length; i++) {
			var when = (inResponse[i].modified !== inResponse[i].posted) ? inResponse[i].modified : inResponse[i].posted;
			when = new Date(when);
			var ampm = "";
			var hours = when.getHours() + 1;
			try {
				if (enyo.g11n.Fmts.prototype.isAmPm()) {
					hours = when.getHours() % 12;
					ampm = (when.getHours() > 11) ? "pm" : "am";
				}
			} catch(e) {
				// uh oh, exception?!?
				// let's just run the code anyway, ignoring the enyo.g11n.Fmts.prototype.isAmPm() method
				hours = when.getHours() % 12;
				ampm = (when.getHours() > 11) ? "pm" : "am";
			}
			delete when;
			var mins = when.getMinutes();
			if (mins < 10)
				mins = "0" + mins;
			this.content[category].push({
				title: inResponse[i].title,
				modified: inResponse[i].modified,
				src: inResponse[i].featured,
				content: inResponse[i].excerpt,
				author: inResponse[i].author,
				permalink: inResponse[i].permalink,
				postid: inResponse[i].id,
				postedAt: (when.getMonth()+1) + "/" + when.getDate() + "/" + when.getFullYear() + " " + hours + ":" + mins + ampm + " ET"
			});
			delete mins;
			delete inResponse[i];
		}
		delete inResponse;
		for (var n in this.content) {
			if (this.content[n].length == 0 && this.getContentError[n] != "failed")
				return;
		}
		this.$.scrim.destroy();
	},
	/* onFailure handler for the article article retrieval WebService */
	gotContentFailure: function(inSender, inResponse, inRequest) {
		var category = this.categoriesByName[this.categories.indexOf(inRequest.params.category)];
		if (this.getContentError[category] === true) {
			this.$.errorWithFeedsPopup.openAtCenter();
			this.getContentError[category] = "failed";
			for (var n in this.content) {
				if (this.content[n].length == 0 && this.getContentError[n] != "failed")
					return;
			}
			this.$.scrim.destroy();
		} else {
			// try again
			this.$.getContent.call({
				category: inRequest.params.category,
				posts: 20,
				brief: 1
			});
			this.getContentError[category] = true;
		}
	},
	/* article arrays for the articles */
	content: {
		news: [],
		reviews: [],
		tips: [],
		meetups: [],
		podcasts: [],
		aod: [],
		prenotes: [],
		promocodes: []
	},
	/* were there errors or failures? */
	getContentError: {
		news: false,
		reviews: false,
		tips: false,
		meetups: false,
		podcasts: false,
		aod: false,
		prenotes: false,
		promocodes: false
	},
	/* open the article view to the article the user tapped on */
	openArticle: function(inEvent, inCategory, inIndex) {
		this.openedArticle = {};
		this.openedArticle.article = this.content[inCategory][inIndex];
		this.$.pane.selectViewByName("articleView");
		this.$.articleTitle.setContent(this.openedArticle.article.title);
		this.$.articleContent.setContent("<div class=\"mediumText\">By " + this.openedArticle.article.author + ". Posted " + this.openedArticle.article.postedAt + "</div>" + this.openedArticle.article.content);
		this.fetchComments();
		this.$.articleContentScroller.scrollTo(0, 0);
		this.$.commentsScroller.scrollTo(0, 0);
	},
	/* intercept clicks on article content so we can show a popup to view the image */
	interceptClick: function(inSender, inEvent) {
		if (inEvent.target) {
			switch(inEvent.target.nodeName) {
				case "A":
					inEvent.stopPropagation();
					var children = inEvent.target.childNodes;
					for (var i = 0; i < children.length; i++) {
						if (children[i].nodeName && children[i].nodeName == "img")
							return;
					}
					break;
				case "IMG":
					inEvent.stopPropagation();
					inEvent.preventDefault();
					// open popup with option to "View Full Size Image"
					break;
			}
		}
	},
	/* go back from article view to main view */
	goBack: function() {
		this.$.articleContent.setContent("");
		this.$.articleTitle.setContent("");
		this.$.articleView.destroy();
		this.$.pane.back();
	},
	/* get the article comments */
	fetchComments: function() {
		this.$.getDisqusThread.call({
			url: this.openedArticle.article.permalink,
			forum_api_key: "hxGZJwHvRswfHrfeqzutQTyo7mxZ1oXeTj0m1L6hhq0v6o9IaTqtzTYrmu9SfOT1"
		});
	},
	/* onSuccess handler for getDisqusThread WebService */
	gotDisqusThread: function(inSender, inResponse, inRequest) {
		if (!inResponse.succeeded) /* failed, just give up... */
			return;
		this.openedArticle.commentsThread = inResponse.message.id;
		/* now retrieve the comments */
		this.$.getComments.call({
			forum_api_key: "hxGZJwHvRswfHrfeqzutQTyo7mxZ1oXeTj0m1L6hhq0v6o9IaTqtzTYrmu9SfOT1",
			thread_id: this.openedArticle.commentsThread,
			limit: 75,
			exclude: "spam,killed,new"
		});
	},
	/* onSuccess handler for getComments WebService */
	gotComments: function(inSender, inResponse, inRequest) {
		if (!inResponse.succeeded)
			return;
		
		this.openedArticle.comments = inResponse.message;
		
		var threaded = [];
		for(i = (inResponse.message.length - 1); i >= 0 ; i--) {
			inResponse.message[i].responses = [];
			inResponse.message[i].visited = false;
			threaded[inResponse.message[i].id] = inResponse.message[i];
			if((inResponse.message[i].parent_post !== null) &&
				(threaded[inResponse.message[i].parent_post] !== undefined)) {
				threaded[inResponse.message[i].parent_post].responses.push(inResponse.message[i]);
			}
		}
		var comments = [];
		for(msgID in threaded) {
			var arr = this.buildCommentsArray(threaded[msgID], 0);
			comments = comments.concat(arr);
		}
		var now = new Date();
		var nowMS = (now.getTime()/1000);
		var formatter = new enyo.g11n.DateFmt({
			date: "small",
			time: "small",
			format: "small",
			TZ: "GMT",
			twelveHourFormat: true
		});
		for (var i = 0; i < comments.length; i++) {
			var created = new Date(comments[i].created_at);
			var timeDiff = nowMS - ((created.getTime() / 1000) - (now.getTimezoneOffset() * 60));
			var relative;
			if (timeDiff < 60)
				relative = " less than a minute ago";
			else if (timeDiff < 3600)
				relative = " about " + parseInt(timeDiff / 60, 10) + " minutes ago";
			else if (timeDiff < 84400) {
				relative = " about " + parseInt(timeDiff / 3600, 10) + " hours ago";
			}
			else
				relative = formatter.formatRelativeDate(created, {
					referenceDate: now,
					verbosity: true
				});
			comments[i].created_at = relative;
			delete created;
		}
		delete now;
		this.openedArticle.comments = comments;
		
		this.$.commentsList.render();
	},
	/* build the comment array in the threaded order, adding a className for the thread level .. supports 5 levels */
    buildCommentsArray: function(msg, level) {
        var comment = [];
        
        if(!msg.visited)  {
            msg.visited = true;
			msg.className = "commentLevel" + level;
            comment.push(msg);
			
            for(i = 0; i < msg.responses.length; i++) {
                comment = comment.concat(this.buildCommentsArray(msg.responses[i], (level+1) || 1));
            }
        }
        return comment;
    },
	/* onSetupRow method for the comments list */
	loadComments: function(inSender, inIndex) {
		if (this.openedArticle && this.openedArticle.comments && this.openedArticle.comments[inIndex]) {
			var r = this.openedArticle.comments[inIndex];
			var className = "enyo-item articleComment " + r.className;
			if (inIndex === 0)
				className += " first";
			if (inIndex === this.openedArticle.comments.length - 1)
				className += " last";
			this.$.commentsListItem.setClassName(className);
			this.$.commentsListItemText.setContent(r.message.replace(/\n/gi, "<br>"));
			this.$.commentsListItemAuthor.setContent(((r.is_anonymous) ? r.anonymous_author.name : (r.author.display_name||r.author.username)) + " posted " + r.created_at);
			this.$.commentsListItemAvatar.setSrc((!r.is_anonymous && r.author.has_avatar) ? r.author.avatar.small : "http://mediacdn.disqus.com/1287621456/images/noavatar32.png");
			return true;
		}
	},
	/* open the add comment popup */
	addComment: function() {
		this.$.addCommentPopup.openAtCenter();
	},
	/* share the article */
	shareArticle: function(inSender, inEvent) {
		/* shorten the URL with bit.ly */
		this.$.shortenURL.call({
			login: "worxl",
			apiKey: "R_7b985a42bba43089546ee8eadde8f765",
			longUrl: this.openedArticle.article.permalink,
			format: "json"
		},
		{
			/* onSuccess handler is shareToFacebook or shareToTwitter */
			onSuccess: "shareTo" + inEvent.value
		});
	},
	/* onSuccess handler for shortenURL WebService when posting to Facebook */
	shareToFacebook: function(inSender, inResponse, inRequest) {
		if (inResponse.status_code === 200) {
			this.$.appMgr.call({
				id: "com.palm.app.enyo-facebook",
				params: {
					type: "status",
					statusText: this.openedArticle.article.title + " on webOSroundup: " + inResponse.data.url + " (via webOSroundup XL)"
				}
			});
		} else {
			// TODO: display error... or just use long URL??
		}
	},
	/* onSuccess handler for shortenURL WebService when posting to Twitter */
	shareToTwitter: function(inSender, inResponse, inRequest) {
		if (inResponse.status_code === 200) {
			// right now we only have Spaz HD on webOS, so we'll use that!
			this.$.appMgr.call({
				id: "com.funkatron.app.spaz-hd",
				params: {
					action: "prepPost",
					msg: this.openedArticle.article.title + ": " + inResponse.data.url + " via @webOSroundup XL"
				}
			});
		} else {
			// TODO: display error... or just use long URL??
		}
	},
	/* open up the "Share Article" popup */
	openSharePopup: function(inSender, inEvent) {
		this.$.shareArticleMenu.openAtEvent(inEvent);
	},
	/* override normal destroy() method to clean out a few things on our own */
	destroy: function() {
		this.destroyComponents();
		for (var e in this.node) {
			if (this.node && this.node[e])
				delete this.node[e]; // do garbage collection
		}
		this.inherited(arguments);
		for (var n in this) {
			delete this[n];
		}
		delete this;
		delete document;
	},
	/* button handler to post the comment */
	comment_post: function() {
		var missing = false;
		if (this.$.comment_name.getValue().length == 0) {
			missing = true;
			this.$.comment_name_warning.show();
		} else {
			this.$.comment_name_warning.hide();
		}
		if (this.$.comment_email.getValue().length == 0) {
			missing = true;
			this.$.comment_email_warning.show();
		} else {
			this.$.comment_email_warning.hide();
		}
		if (this.$.comment_comment.getValue().length == 0) {
			missing = true;
			this.$.comment_comment_warning.show();
		} else {
			this.$.comment_comment_warning.hide();
		}
		if (missing === false) {
			/* if nothing is missing, post the comment */
			this.$.postComment.call({
				thread_id: this.openedArticle.commentsThread,
				forum_api_key: "hxGZJwHvRswfHrfeqzutQTyo7mxZ1oXeTj0m1L6hhq0v6o9IaTqtzTYrmu9SfOT1",
				message: this.$.comment_comment.getValue() + "\n-- sent from webOSroundup XL",
				author_name: this.$.comment_name.getValue(),
				author_email: this.$.comment_email.getValue()
			});
		}
	},
	/* the comment was posted */
	sentComment: function(inSender, inResponse, inRequest) {
		/* close the comment box ... perhaps refresh comments as well? */
		this.comment_close();
	},
	/* the comment failed to get sent */
	failedToSendComment: function(inSender, inResponse, inRequest) {
		this.$.comment_popup_failed.show();
	},
	/* close comment popup and set values to empty */
	comment_close: function() {
		this.$.comment_comment.setValue("");
		this.$.comment_name.setValue("");
		this.$.comment_email.setValue("");
		this.$.comment_popup_failed.hide();
		this.$.addCommentPopup.close();
	}
});