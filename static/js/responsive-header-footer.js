/* Used on Responsive/Non-Responsive New Header/Footer (push to /static/js only) */

var RootPath = RootPath || '/';

//Adding language path as a class to the html tag for stylesheet reference.
$('html').addClass(RootPath.replace(/\//g, ''));

//Initially store the width of the page.
var pageType = pageTypeLabel = '', pageWidth = getPageProperties(), resizeFn = [], localizedContent = [], resizeInterval = null;

$(document).ready(function () {
	addResize(function () {
		$('.open').removeClass('open');
		$('#country-popup').css('display', '');
	}, true);

	processHeaderFooter();

	$('body')
		.on('click', '.ga', function (e) {
			//GA event tracking - naveen
			//Class "ga" should only be applied on to anchor tag.

			//This will prevent the default action of the anchor tag.
			e.preventDefault();

			//Retrieving URL of the anchor tag to be used later after GA Event Tracking is successfully submitted
			var URL = $(this).attr('href'), eLabel = $(this).data('gal'), eValue = $(this).data('gav'), redirect = false;

			//Object to send to GA Event Tracking.
			var obj = {
				hitType: 'event',
				eventCategory: $(this).data('gac'),
				eventAction: $(this).data('gaa')
			};

			if (eLabel !== undefined) {
				obj.eventLabel = eLabel;
			}

			if (eValue !== undefined) {
				obj.eventValue = parseInt(eValue);
			}

			//Redirect after event tracking is successfully sent to GA if URL is not undefined.
			if (URL !== undefined) {
				obj.hitCallback = redirectURL;
			}

			/* To be implemented later */
			/*var targetURLHost = parseUri($(this).attr('href'))['host'].toLowerCase();

			 if (targetURLHost != '' && location.host != targetURLHost && targetURLHost != 'www.dellsoftware.com') {
			 obj.transport = 'beacon';
			 obj.eventCategory = 'Outbound Link';
			 obj.eventAction = 'click';
			 obj.eventLabel = $(this).attr('href');
			 }*/

			// adds Event10 for siteCatalyst bug# 22253
			if ($(this).attr('data-gaa') == 'Buy Online') {
				sc_LinkTrackSetBuy();
			}

			//Make sure that GA is loaded
			if (typeof ga != 'undefined' && ga.hasOwnProperty('loaded') && ga.loaded === true) {
				if (URL !== undefined) {
					//Fallback if hitCallback does not execute in time.
					setTimeout(redirectURL, 1000);
				}

				//Send event tracking to google.
				ga('send', obj);
			}
			else if (URL !== undefined) {
				redirectURL();
			}

			/**
			 * Redirect function.
			 */
			function redirectURL() {
				if (!redirect) {
					redirect = true;
					location.href = URL;
				}
			}
		})
		.on('click', '.btn-buy', function (e) {
			//Site Catalyst Custom Event Tracking for Buy Online
			//TODO: Might want to generalize this so that this can be used for other custom events.

			var URL = $(this).attr('href'), URLTarget = $(this).attr('target'), redirect = false;

			//Only track links pointing to shop.software.dell.com
			if (typeof s != "undefined" && /^https\:\/\/shop\.(quest|software\.dell)\.com/.test(URL)) {
				e.preventDefault();

				var newWin = null;

				//Determine if destination URL needs to open in a new window/tab.
				if (URLTarget !== undefined && URLTarget != '_self' && URLTarget != '') {
					//Need to open immediately or else chrome/firefox popup block will block it.
					newWin = window.open('', URLTarget);
				}

				s.linkTrackEvents = "event10";
				s.events = "event10";
				s.pageName = sc_GetPageName("");
				sc_CookieSet("SCBuy", s.events, 20);

				setTimeout(redirectURL, 1000);

				//Submit tracking link to site catalyst. Once done, redirect user to desired destination.
				s.tl(this, 'o', $(this).text(), null, function () {
					redirectURL();
				});
			}

			function redirectURL() {
				if (!redirect) {
					redirect = true;

					if (newWin) {
						newWin.location = URL;
					}
					else {
						location.href = URL;
					}
				}
			}
		})
		.on('click', '.dropdown', function (e) {
			//Prevent dropdown from hiding when clicking on a non-link area.
			if ($(e.target).parents('.dropdown-menu').length) {
				e.stopPropagation();
			}
			else {
				//Dropdown class is being used in the utility toolbar.
				//Close all dropdown that is a sibling to the clicked element.

				$(this).siblings().removeClass('open');
				$('#masthead-search').removeClass('open');
				//$(this).toggleClass('open');
			}
		});
});

$(window).load(function () {
	//This is only used on the new header/footer not responsive.
	$('.bootstrap').each(function () {
		//copy modernizr classes from html tag to be copied over to where .bootstrap class is defined.
		$(this).get(0).className = $.trim($(this).get(0).className) + ' ' + $.trim($('html').get(0).className);
	});

	/*$('footer').find('a').each(function() {
	 $(this).removeAttr('onclick');
	 });*/

	if ($('html').hasClass('touch')) {
		$.getScript('/static/library/jQueryMobile/jquery.mobile.custom.min.js');
	}

	if (pageWidth < 992) {
		$.getScript('/static/library/jQuery/jquery.color-2.1.2.min.js');
	}
});

$(window).resize(function () {
	//Prevent resizing from firing when modifying dom structure.

	var prevPageType = pageType;

	pageWidth = getPageProperties();

	//Execute only when page type has changed.
	if (prevPageType != pageType) {
		if (resizeInterval !== null) {
			clearInterval(resizeInterval);
		}

		resizeInterval = setInterval(function () {
			clearInterval(resizeInterval);
			resizeInterval = null;

			$.each(resizeFn, function (i, obj) {
				if (typeof obj.fn == 'function') {
					if (obj.type === undefined || obj.type == pageType) {
						obj.fn.call();
					}
				}
				else if (typeof window[obj.fn] == 'function') {
					if (obj.type === undefined || obj.type == pageType) {
						window[obj.fn].call();
					}
				}
			});
		}, 100);
	}
});

function processHeaderFooter() {
	var headerNavElem = $('.main-nav-section');

	/*
	 Get navigation via ajax. Should only be executed on non home page.

	 Note: All non home page (responsive) will use the special tag V2LayoutHeaderAjax which has a data-ajax="true" attribute.
	 V2LayoutHeaderAjaxNav contains the navigation html content.
	 */
	(function () {
		var specialTag = 'V2LayoutHeaderAjaxNav', sessionName = 'nav-' + RootPath.replace(/\//g, '');

		if (headerNavElem.data('ajax')) {
			//If session storage is available, populate navigation. Note: if navigation has been updated when nav is already stored, it'll be one page view behind.
			if (sessionStorage[sessionName]) {
				headerNavElem.append(sessionStorage[sessionName]);
			}

			//Get navigation and store
			getLocalizedContent(specialTag).done(function (data) {
				//Populate navigation only if sessionStorage.nav is not present because if it is present, it would have already been populated on line 32.
				if (!sessionStorage[sessionName]) {
					headerNavElem.append(data[specialTag]);
				}

				//Store latest navigation.
				sessionStorage.setItem(sessionName, data[specialTag]);
			});
		}
		else {
			//Get navigation and store
			getLocalizedContent(specialTag).done(function (data) {
				//Store latest navigation.
				sessionStorage.setItem(sessionName, data[specialTag]);
			});
		}
	})();

	//Prevent anchor tag from firing when href is set to #
	headerNavElem.on('click', 'ul.tier2 a[href=#]', function (e) {
		if ($('html').width() >= 768) {
			e.preventDefault();
		}
	});

	//only shown in mobile
	$('#mobile-search-button').on('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		$('#masthead-search').toggleClass('open');
		$('.utility').find('> li').removeClass('open');
	});

	//Prevent anchor tag from firing when href is set to # on mobile
	$('.footer-top-section').on('click', 'a[href=#]', function (e) {
		if ($('html').width() < 768) {
			e.preventDefault();
		}
	});

	$('body')
		.on('click', '.subLinks > a, .subLinks > span', function (e) {
			//Add functionality for when user uses touch on navigation/footer.

			if ($(this).parents('#footer').length && pageWidth >= 768) {
				return false;
			}

			e.preventDefault();
			e.stopPropagation();

			var elem = $(this).parent();

			//Remove all "open" class that is a sibling to the currently touched element.
			elem.siblings()
				.find('.open').removeClass('open').end()
				.removeClass('open');

			if (elem.hasClass('open')) {
				//Remove all "open" class inside of the currently touched element.
				elem.find('.open').removeClass('open').end().removeClass('open');
			}
			else {
				elem.addClass('open');

				//fix for sonicwall height
				$('body').trigger('subnav.visible');

				if (pageType == 0) { //Mobile
					//Animate background color to notify user that they have touched that element.
					//Require: jQuery Color v2.1.2 plugin
					var originalBG = $(this).css('background-color');

					elem.css({backgroundColor: '#007db8'});

					$('html, body').animate({scrollTop: $(this).offset().top}, function () {
						elem.animate({backgroundColor: originalBG}, 500, function () {
							elem.css('backgroundColor', '');
						});
					});
				}
			}
		})
		.on('click', function () {
			//Close country popup when user clicks any where on the page.
			if (pageWidth > 767) {
				$('#country-popup').css('display', '');
			}
		})
		.on('click', '.navbar-toggle', function (e) {
			e.stopPropagation();

			//Hamburger - Mobile
			//Open & Close slide out navigation.
			if ($('html').width() < 768) {
				e.preventDefault();
				$('html').toggleClass('openNav');
				$('.utility').find('> li').removeClass('open');
				$('#masthead-search').removeClass('open');
			}
		});

	/* Country Dropdown */
	$('#current-country').on('click', function (e) {
		if (pageWidth > 767) {
			e.stopPropagation();
			e.preventDefault();
			$('#country-popup').toggle();
		}
	});

	//Issue with iPad Chrome where links couldn't be clicked.
	//Reason was for SiteCatalyst injecting onclick attribute to all anchor tag.
	$('footer').on('click', 'a', function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		//added this condition to open links in a new tab when needed
		if ($(this).attr('target') != undefined && $(this).attr('target') == '_blank') {
			window.open($(this).attr('href'));
		}
		else {
			location.href = $(this).attr('href');
		}
	});

	initSearch();
}

function getPageProperties() {
	//Workaround for Google Chrome. The vertical scrollbar is not included in determining the width of the device.
	$('body').css('overflow', 'hidden');
	var w = $('html').width();

	$('body').css('overflow', '');

	//Define pageType
	if (w >= 1200) {
		pageType = 3;
		pageTypeLabel = 'lg';
	}
	else if (w >= 992) {
		pageType = 2;
		pageTypeLabel = 'md';
	}
	else if (w >= 768) {
		pageType = 1;
		pageTypeLabel = 'sm';
	}
	else {
		pageType = 0;
		pageTypeLabel = 'xs';
	}

	return w;
}

function addResize(fn, runImmediately, type) {
	if (runImmediately) {
		if (typeof fn == 'string' && typeof window[fn] == 'function') {
			window[fn].call();
		}
		else if (typeof fn == 'function') {
			fn.call();
		}
	}

	//TODO: Account for duplication.

	resizeFn.push({fn: fn, type: type});
}

//This is used to make a not responsive page responsive. This will be removed when all pages converts to be responsive.
function makeResponsive() {
	$('.not-responsive').removeClass('not-responsive').addClass('is-responsive');
	$('#wrapper').attr('id', '').addClass('site-wrapper').wrapInner('<div class="site-canvas">');
}

function getLocalizedContent(tags) {
	//How to call: getLocalizedContent('RegWarningMessageEmailRequired').done(function(data) { console.log(data); });
	var returnValue = {}, newTags = [], deferred = $.Deferred();

	if (typeof tags == 'string') {
		if (localizedContent[tags]) {
			return localizedContent[tags];
		}
		else {
			newTags.push(tags);
		}
	}
	else {
		$.each(tags, function (i, tag) {
			if (localizedContent[tag]) {
				returnValue[tag] = localizedContent[tag];
			}
			else {
				newTags.push(tag);
			}
		});
	}

	if (newTags.length) {
		$.ajax({
			url: (((typeof RootPath == 'undefined' || RootPath == '/') ? '' : RootPath) + '/jsonreq/event/').replace('//', '/'),
			type: 'POST',
			dataType: 'JSON',
			data: {
				type: 'localized tags',
				tags: newTags.join(',')
			}
		}).done(function (data) {
			$.each(data.data, function (i, obj) {
				returnValue[obj.id] = obj.value;
				localizedContent[obj.id] = obj.value;
			});

			deferred.resolve(returnValue);
		});
	}
	else {
		deferred.resolve(returnValue);
	}

	return deferred;
}

//Determines when CSS transitions end.
function transitionEnd(e, fn) {
	var e = $(e).get(0), listenedEvent = '';

	function whichTransitionEvent() {
		var t, el = document.createElement('fakeelement'), transitions = {
			'transition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'MozTransition': 'transitionend',
			'WebkitTransition': 'webkitTransitionEnd'
		};

		for (t in transitions) {
			if (el.style[t] !== undefined) {
				listenedEvent = transitions[t];
				return transitions[t];
			}
		}
	}

	function listenerFn() {
		fn.call(this);
		e.removeEventListener(listenedEvent, listenerFn);
	}

	var transitionEvent = whichTransitionEvent();

	transitionEvent && e.addEventListener(transitionEvent, listenerFn);
}

function objectEquals(x, y) {
	'use strict';

	if (x === null || x === undefined || y === null || y === undefined) {
		return x === y;
	}
	// after this just checking type of one would be enough
	if (x.constructor !== y.constructor) {
		return false;
	}
	// if they are functions, they should exactly refer to same one (because of closures)
	if (x instanceof Function) {
		return x === y;
	}
	// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
	if (x instanceof RegExp) {
		return x === y;
	}
	if (x === y || x.valueOf() === y.valueOf()) {
		return true;
	}
	if (Array.isArray(x) && x.length !== y.length) {
		return false;
	}

	// if they are dates, they must had equal valueOf
	if (x instanceof Date) {
		return false;
	}

	// if they are strictly equal, they both need to be object at least
	if (!(x instanceof Object)) {
		return false;
	}
	if (!(y instanceof Object)) {
		return false;
	}

	// recursive object equality check
	var p = Object.keys(x);
	return Object.keys(y).every(function (i) {
			return p.indexOf(i) !== -1;
		}) &&
		p.every(function (i) {
			return objectEquals(x[i], y[i]);
		});
}

function initSearch() {
	var searchFieldElem = $('#searchterm');
	var searchFormElem = $('#search-form');

	$(document).ready(function () {
		searchFieldElem.unbind("keypress");

		//TODO: Figure out what this does.
		var b = {};
		(function () {
			var j, l = /\+/g, k = /([^&=]+)=?([^&]*)/g, n = function (o) {
				return decodeURIComponent(o.replace(l, " "))
			}, m = window.location.search.substring(1);
			while (j = k.exec(m)) {
				b[n(j[1])] = n(j[2])
			}
		})();

		searchFieldElem.attr('autocomplete', 'off');
		searchFieldElem.val(Encoder.htmlDecode(b.q)).keypress(function (j) {
			if (j.which == 13) {
				j.preventDefault();
				goSearch($('#searchterm').val());
			}
		});

		searchFormElem.on('click', '.btn', function () {
			goSearch($('#searchterm').val());
		});

		if (searchFormElem.length) {
			$('#search-form').on('submit', function (e) {
				e.preventDefault();
				goSearch($('#searchterm').val());
				return false;
			});
		}

		if (!$.fn.autocomplete) {
			$.getScript('/Static/Scripts/jquery.autocomplete.min.js', function () {
				initAdobeSearch();
			});
		}
		else {
			initAdobeSearch();
		}
	});

	function initAdobeSearch() {
		var config = {
			account: "sp10050c33",
			//searchDomain: "http://sp10050c33.guided.ss-omtrdc.net",
			searchDomain: siteTags.SiteSearchDomainUnified,
			inputElement: "#searchterm",
			inputFormElement: "#search-form",
			delay: 300,
			minLength: 2,
			maxResults: 10,
			browserAutocomplete: false,
			queryCaseSensitive: false,
			startsWith: false,
			searchOnSelect: true,
			submitOnSelect: true,
			highlightWords: false,
			highlightWordsBegin: false
		};

		if ($.fn.AdobeAutocomplete) {
			$('#searchterm').AdobeAutocomplete(config);

			if ($('#q3').length) {
				$('#q3').AdobeAutocomplete($.extend({}, config, {inputElement: '#q3', inputFormElement: '#q3form'}));
			}
		}
		else {
			//$.getScript('//content.atomz.com/content/pb00003799/publish/build/search/jquery/autocomplete/1.4/jquery.adobe.autocomplete.min.js', function () {
			$.getScript('/viewScripts/jquery.adobe.autocomplete.js', function () {
				$('#searchterm').AdobeAutocomplete(config);
				if ($('#q3').length) {
					$('#q3').AdobeAutocomplete($.extend({}, config, {inputElement: '#q3', inputFormElement: '#q3form'}));
				}
			});
		}
	}

	function goSearch(searchterm) {
		window.VWO = window.VWO || [];

		VWO.push(['nls.formAnalysis.markSuccess', document.getElementById('search-form'), true]);

		if (isDoubleByte(searchterm)) {
			searchterm = encodeURIComponent(searchterm);
		}
		else {
			searchterm = encodeURIComponent(Encoder.htmlEncode(searchterm));
		}

		document.location.href = RootPath + "search/results/?q=" + searchterm;

		return false;
	}

	function isDoubleByte(str) {
		for (var i = 0, n = str.length; i < n; i++) {
			if (str.charCodeAt(i) > 255) {
				return true;
			}
		}
		return false;
	}
}

