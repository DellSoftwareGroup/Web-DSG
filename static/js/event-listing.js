var populateListingPending = false, //prevent populate listing to load more than 1 at a time.
	entriesPerType = { //xs,sm - need to consult with cindy chan.
		'0': 6,
		'1': 12,
		'2': 16,
		'3': 16
	},
	endPointURL = (((RootPath == '/') ? '':RootPath) + '/jsonreq/event/').replace('//', '/'),
	page = 1,
	rowContainer = $('.listing-entries').find('.row');

if ($.fn.multipleSelect) {
	init();
} else {
	// load multiple select stylesheet
	if($('html').hasClass('ie8')) {
		$('<link/>', {rel: 'stylesheet', href: '/static/library/css/multiple-select.css'}).appendTo('head');
	}

	//load multiple select plugin
	$.getScript("/static/library/jQuery/jquery.multiple.select.js", function() {
		$.fn.multipleSelect.defaults.onOpen = function(elem) {
			var nextElem = $(elem).next(), ul = nextElem.find('ul');

			if(ul.outerHeight() < ul.prop('scrollHeight') && !ul.data('width-fixed')) {
				ul.css('width', ul.outerWidth() + $.position.scrollbarWidth());
				ul.data('width-fixed', true);
			}

			//Check if dropdown needs to be reversed.
			nextElem.css('right', 'auto');

			if(nextElem.offset().left + nextElem.find('ul').outerWidth(true) > $('body').width()) {
				nextElem.css('right', 0);
			}
			else {
				nextElem.css('right', 'auto');
			}
		};

		init();
	});
}

if (typeof RootPath == 'undefined') {
	RootPath = '/';
}

function init() {
	// Local variable value
	var ajaxArr = [],
		filterMap = [
			{
				targetID: 'country',
				data: {"type": "event country"},
				init: true,
				callback: function (title) {
					$(this).prev().text(title);
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: title,
						multiple: false,
						selectAll: false,
						single: true,
						onClick: function (view) {
							if (view.value != '') {
								populateDropdowns(filterMap[7].targetID, $.extend({}, filterMap[7].data, {country: view.value}), filterMap[7].callback).done(function() {
									$('#state_province').next().removeClass('hidden');
								});
							}
						}
					});
					$(this).multipleSelect("uncheckAll");
				}
			},
			{
				targetID: 'event_type',
				data: {"type": "event type"},
				init: true,
				callback: function (title) {
					$(this).prev().text(getLocalizedContent('EventLabelEventType'));
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: getLocalizedContent('EventLabelEventType'),
						minimumCountSelected: 0,
						countSelected: getLocalizedContent('EventLabelEventType') + '&nbsp;(#)',
						selectAllText: getLocalizedContent('LabelAllEventsSelected'),
						allSelected: getLocalizedContent('LabelSelectAllEvents'),
						onClose: function() {
							// minimum one event should be selected
							if (!$("#event_type").multipleSelect("getSelects").length) {
								$("#event_type").multipleSelect("setSelects", [1]);
							}
						}
					});
					$(this).multipleSelect("checkAll");
				}
			},
			{
				targetID: 'event_date',
				data: {"type": "event dates"},
				init: true,
				callback: function (title) {
					$(this).prev().text(getLocalizedContent('EventLabelDate'));
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: title,
						multiple: false,
						selectAll: false,
						single: true
					});
					$(this).multipleSelect("uncheckAll");
				}
			},
			{
				targetID: 'brand',
				data: {"type": "event product line"},
				init: true,
				callback: function (title) {
					$(this).prev().text(title);
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: title,
						multiple: false,
						selectAll: false,
						single: true,
						onClick: function (view) {
							var obj = {brand: view.value};

							$.each([4, 5], function (i, j) {
								ajaxArr.push(populateDropdowns(filterMap[j].targetID, $.extend({}, filterMap[j].data, obj), filterMap[j].callback));
							});
						}
					});
					$(this).multipleSelect("uncheckAll");
				}
			},
			{
				targetID: 'product',
				data: {"type": "event product"},
				init: true,
				callback: function (title, prevValue) {
					if (this.data('multipleSelect')) {
						$(this).next().find('ul').remove();
						$(this).multipleSelect('refresh');
						$(this).multipleSelect('setSelects', [prevValue]);
					}
					else {
						$(this).prev().text(title);
						$(this).parent().removeClass('hidden');
						$(this).multipleSelect({
							placeholder: title,
							multiple: false,
							selectAll: false,
							single: true,
							onClick: function (view) {
								if (view.value != '') {
									$('#solution').multipleSelect('setSelects', []);
								}
							}
						});
						$(this).multipleSelect("uncheckAll");
					}
				}
			},
			{
				targetID: 'solution',
				data: {"type": "event solution"},
				init: true,
				callback: function (title, prevValue) {
					if ($(this).data('multipleSelect')) {
						$(this).next().find('ul').remove();
						$(this).multipleSelect('refresh');
						$(this).multipleSelect('setSelects', [prevValue]);
					}
					else {
						$(this).prev().text(title);
						$(this).parent().removeClass('hidden');
						$(this).multipleSelect({
							placeholder: title,
							multiple: false,
							selectAll: false,
							single: true,
							onClick: function (view) {
								if (view.value != '') {
									$('#product').multipleSelect('setSelects', []);
								}
							}
						});
						$(this).multipleSelect("uncheckAll");
					}
				}
			},
			{
				targetID: 'language',
				data: {"type": "event language"},
				init: true,
				callback: function (title) {
					$(this).prev().text(title);
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: title,
						multiple: false,
						selectAll: false,
						single: true
					});
					$(this).multipleSelect('setSelects', [getLanguageCode()]);
				}
			},
			{
				targetID: 'state_province',
				data: {"type": "event state"},
				init: false,
				callback: function (title) {
					if (this.data('multipleSelect')) {
						$(this).next().find('ul').remove();
						$(this).multipleSelect('refresh');
						//$(this).multipleSelect('setSelects', [prevValue]);
					}
					else {
						$(this).prev().text(title);
						$(this).parent().removeClass('hidden');
						$(this).multipleSelect({
							placeholder: title,
							multiple: false,
							selectAll: false,
							single: true
						});
						$(this).multipleSelect("uncheckAll");
					}
				}
			}
		];

	$(document).ready(function () {
		// filters event handler
		var filterInterval = null;

		//Populate all "filter by" dropdowns
		getLocalizedContent(['EventLabelEventType', 'EventLabelDate', 'EventLabelEventType', 'LabelAllEventsSelected', 'LabelSelectAllEvents', 'EventLabelDate', 'EventLabelRecordedDate']).done(function() {
			$.each(filterMap, function (i, entry) {
				if (entry.init) {
					ajaxArr.push(populateDropdowns(entry.targetID, entry.data, entry.callback));
				}
			});

			//When filters are loaded, execute function 'hashchange'
			$.when.apply(this, ajaxArr).done(function () {
				if (location.hash.length) {
					parseHashTag();
				}

				$(this).data('continue', true);

				$('.filters').on('change', 'select', function () {
					if ($(this).data('continue') && filterInterval === null) {
						filterInterval = setInterval(function () {
							clearInterval(filterInterval);

							setTimeout(function () {
								filterInterval = null;
							}, 100);

							if (ajaxArr.length) {
								$.when(ajaxArr).done(function () {
									populateListing();
									ajaxArr = [];
								});
							}
							else {
								populateListing();
							}
						}, 100);
					}
				});

				ajaxArr = [];

				populateListing();
			}).fail(function() {
				alert('Failed');
			});
		});

		// to reset drop down selected
		$('body').on('click', '.resetfilter', function (e) {
			e.preventDefault();

			var filterElem = $('.filters');

			filterElem.data('continue', false);

			// multiselect uncheckall
			filterElem.find('select').each(function() {
				if($(this).next().is(':visible')) {
					if($(this).attr('id') == 'event_type') {
						$(this).multipleSelect('checkAll');
					}
					else if($(this).attr('id') == 'language') {
						$(this).multipleSelect("setSelects", [getLanguageCode()]);
					}
					else {
						$(this).multipleSelect('uncheckAll');
					}
				}
			});

			filterElem.data('continue', true);
			populateListing(true);
		});

		$('#view-more').on('click', function (e) {
			e.preventDefault();

			$(this).addClass('hidden');

			var top = window.scrollY || $('html').scrollTop();

			populateListing(false).done(function() {
				window.scrollTo(0, top);
			});

			window.scrollTo(0, top);
		});
	});

	function parseHashTag() {
		//Note: This should only be called once if hash tag exist on page load.
		var hash = location.hash.substr(1),
			hashArr = hash.split('_'),
			map = {
				event_type: '',
				brand: 'bybrand',
				product: 'byproduct',
				solution: 'bysolution',
				language: 'bylang'
			},
			hashObj = {};

		$.each(map, function (filterName, filterMapTo) {
			var regexp = new RegExp('^' + filterMapTo, 'i');

			if (hashObj[filterMapTo]) {
				setFilterValue($('#' + filterName), hashObj[filterMapTo]);

				return false;
			}
			else {
				$.each(hashArr, function (indx, name) {
					if (regexp.test(name)) {
						var elem = $('#' + filterName), selectFilterValue = name.replace(regexp, '');

						if (filterName != 'event_type') {
							hashObj[filterMapTo] = selectFilterValue;
						}

						setFilterValue(elem, selectFilterValue);

						return false;
					}
				});
			}
		});

		function setFilterValue(elem, val) {
			if (elem.multipleSelect('getSelects') != elem.val()) {
				elem.find('option').each(function () {
					if ($(this).text().replace(/[\s\W]/g, '').toLowerCase() == val) {
						elem.multipleSelect('setSelects', [$(this).val()]);

						return false;
					}
				});
			}
		}
	}

	function populateDropdowns(dropdown, data, callback) {
		//Find previous value
		var elem = $('#' + dropdown), prevValue = elem.val();

		elem.empty();

		return $.ajax({
			url: endPointURL,
			type: 'POST',
			dataType: 'JSON',
			data: data
		}).done(function (dataopt) {
			if(dataopt.title) {
				elem.append('<option value="">' + dataopt.title + '</option>');
			}

			$.each(dataopt.data, function (key, val) {
				elem.append('<option value="' + val.id + '">' + val.value + '</option>');
			});

			if (typeof callback == 'function') {
				callback.call(elem, dataopt.title, prevValue);
			}
		});
	}
}

addResize(function() { populateListing(true); });

// makes ajax call, result list and index
function populateListing(clear) {
	// clear equals true, it would clear listings
	if (typeof clear == 'undefined') {
		clear = true;
	}

	if (populateListingPending) {
		return false;
	}

	buildAHashTag();

	var dataset = getDataSet(!clear);

	if(dataset === false) {
		return false;
	}

	populateListingPending = true;

	return $.ajax({
		url: endPointURL,
		type: 'POST',
		dataType: 'JSON',
		data: dataset,
		beforeSend: function () {
			$('#ui-loader').show();
		}
	}).done(function (dataopt) {
		populateListingPending = false;

		$('#ui-loader').hide();

		if (clear) {
			rowContainer.empty();
		}

		$.each(dataopt.data, function (key, val) {
			if(val.typeid == 1) {
				event_bg = 'bg-green';
				event_img = 'online-event.jpg';
			}
			else if(val.typeid == 2) {
				event_bg = 'bg-purple';
				event_img = 'in-person-event.jpg';
			}
			else if(val.typeid == 3) {
				event_bg = 'bg-orange';
				event_img = 'webcast.jpg';
			}

			var htmlFragment = '<div class="col-md-3 col-sm-4 col-xs-12" style="display: none;"> ' +
				'<a href="' + val.url + '">' +
				'  <div class="border-grey">' +
				'    <p class="listing-header ' + event_bg + ' "> ' + val.eventtype + ' </p>' +
				'    <img class="img-responsive" src="/images/shared/listing-entries/' + event_img + '" alt=""> ' +
				'  </div> ' +
				'  <h4 class="text-blue">' + val.title + ' </h4> ' +
				'  <p class="teaser"> ' + val.description + ' </p>';

			if($.inArray(val.typeid, [1,2]) > -1) {
				htmlFragment += '<p class="dates">' + getLocalizedContent('EventLabelDate') + ': ' + val.date + '</p>';
			}
			else if(val.typeid == 3) {
				htmlFragment += '<p>' + getLocalizedContent('EventLabelRecordedDate') + ': ' + val.recordeddate + '</p>';
			}

			htmlFragment += '</a></div>';

			rowContainer.append(htmlFragment);

			if ((pageType >= 2 && ((key + 1) % 4 == 0) && key != 0) || (pageType == 1 && ((key + 1) % 3 == 0) && key != 0)) {
				rowContainer.append('<div class="clearfix">');
			}
		});

		var viewMoreButton = $('#view-more');

		//TODO: total record counts < pages x 16 or 12 hide View More button
		if (dataopt.total) {
			$('#no-results').addClass('hidden');

			if(dataopt.total > entriesPerType[pageType] * page) {
				viewMoreButton.removeClass('hidden');
			}
			else {
				viewMoreButton.addClass('hidden');
			}
		}
		else {
			$('#no-results').removeClass('hidden');
			viewMoreButton.addClass('hidden');
		}

		// add total results number
		$('.total_results').html(dataopt.total);

		setTimeout(function() {
			rowContainer.find('> div').filter(':not(:visible)').show().css('opacity', 0).animate({'opacity': 1}, 500);
		}, 100);
	});
}

// Generates hash from selected filters and tabs
function buildAHashTag() {
	var hashArr = [], map = {
		event_type: '',
		product: 'byproduct',
		solution: 'bysolution',
		productline: 'byproductline',
		brand: 'bybrand',
		language: 'bylang'
	};

	$.each(map, function (id, prefix) {
		var elem = $('#' + id), val = elem.multipleSelect('getSelects');

		if (id == 'event_type') {
			if (val.length == 1) {
				hashArr.push($.trim(elem.multipleSelect('getSelects', 'text')).toLowerCase().replace(/[\s\W]/g, ''));
			}
		}
		else {
			if (id == 'language') {
				if (parseInt(elem.val()) == getLanguageCode()) {
					return true;
				}
			}

			var filterValue = $.trim(elem.multipleSelect('getSelects', 'text')[0]).toLowerCase().replace(/[\s\W]/g, '');

			if (filterValue != '') {
				hashArr.push(prefix + filterValue);
			}
		}
	});

	var newHash = hashArr.join('_');
	location.hash = (newHash == '') ? ' ':newHash;
}

function getLanguageCode() {
	if (typeof RootPath == 'string') {
		switch (RootPath) {
			case '/br-pt/':
				initlangval = 139;
				break;
			case '/mx-es/':
				initlangval = 156;
				break;
			case '/cn-zh/':
				initlangval = 202;
				break;
			case '/jp-ja/':
				initlangval = 109;
				break;
			case '/fr-fr/':
				initlangval = 75;
				break;
			case '/de-de/':
				initlangval = 86;
				break;
			default:
				initlangval = 53;
				break;
		}

		if (location.host == 'stage-software-dell-com') {
			switch (RootPath) {
				case '/br-pt/':
					initlangval = 139;
					break;
				case '/mx-es/':
					initlangval = 156;
					break;
				case '/cn-zh/':
					initlangval = 202;
					break;
				case '/jp-ja/':
					initlangval = 109;
					break;
				case '/fr-fr/':
					initlangval = 75;
					break;
				case '/de-de/':
					initlangval = 86;
					break;
				default:
					initlangval = 53;
					break;
			}
		}
	}

	return initlangval;
}

// iterates selected filters and createsd dataset for ajax call
function getDataSet(incrementPage) {
	//incrementPage - We assume that if the list is not cleared that we are going to load the next page.

	var dataset = {
			"type": "event list",
			"page": incrementPage ? ++page : 1,
			"pagesize": entriesPerType[pageType]
		},
		mapping = {
			eventtypes: 'event_type',
			date: 'event_date',
			product: 'product',
			solution: 'solution',
			brand: 'brand',
			language: 'language',
			country: 'country',
			state: 'state_province'
		},
		hasError = false;

	$.each(mapping, function(key, id) {
		var val = $('#' + id).val();

		if(id == 'event_type') {
			if(val === null) {
				hasError = true;
				return false;
			}

			dataset[key] = val.join(',');
		}
		else if(id == 'event_date') {
			dataset[key] = (val === null) ? 'All':val;
		}
		else {
			dataset[key] = val;
		}
	});

	return hasError ? false:dataset;
}