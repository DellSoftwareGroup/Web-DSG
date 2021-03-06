/*
 * Responsive Slide Pagination
 * Created by Edward Chong
 */
(function ($) {
	var methods = {
		destroy: function () {
			var options = $(this).data('options');

			if (options === undefined) {
				return this;
			}

			$(this).off('click', '.prev, .next');
			$(this).find('.rr-pagination').remove();

			$(this).find('.pagination-container').find('> div').unwrap();
			$(this).find(options.list).next().remove();
			$(this).find(options.list).css('display', '');

			return this;
		},
		randomize: randomize
	}, defaults = {
		largeArrow: false
	}, paginationDefault = {
		prevArrow: true,
		nextArrow: true,
		displayTotal: false,
		largeArrow: false,
		align: 'right'
	}, htmlFragment = {
		prevArrow: '<a href="#" class="prev inactive"></a>',
		nextArrow: '<a href="#" class="next[[className]]"></a>',
		displayTotal: '<span>Viewing <span>1</span>-<span>[[end]]</span> of [[total]]</span>'
	};

	$.fn.slidePagination2 = function (options) {
		$(this).each(function () {
			if (typeof options == 'string') {
				return methods[options].call(this);
			}
			else {
				options = $.extend({}, defaults, options);

				methods.destroy.call(this);
				bind.call(this, options);

				$(this).data('options', options);

				if (typeof options.random == 'boolean' && options.random) {
					randomize.call($(this).find(options.list));
				}

				options.target = $(this).find(options.list);

				create.call(this, options);
			}
		});
	};

	function randomize() {
		var li = $(this).find('li');

		li.sort(function (a, b) {
			// Get a random number between 0 and 10
			var temp = parseInt(Math.random() * 10);
			// Get 1 or 0, whether temp is odd or even
			var isOddOrEven = temp % 2;
			// Get +1 or -1, whether temp greater or smaller than 5
			var isPosOrNeg = temp > 5 ? 1 : -1;
			// Return -1, 0, or +1
			return ( isOddOrEven * isPosOrNeg );
		})
			// append list items to ul
			.appendTo($(this));
	}

	function bind() {
		var elem = this;

		$(this).on('click', '.prev, .next', function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();

			if ($(this).hasClass('inactive')) {
				return false;
			}

			var total = $(elem).data('total'),
				page = $(elem).data('page'),
				interval = $(elem).data('interval');

			$(elem).find('.next, .prev').removeClass('inactive');

			if ($(this).hasClass('prev')) {
				if (--page == 0) {
					$(elem).find('.prev').addClass('inactive');
				}
			}
			else {
				if (++page == $(elem).data('totalpage') - 1) {
					$(elem).find('.next').addClass('inactive');
				}
			}

			$(elem)
				.data('page', page)
				.find('.pagination-container').find('> div').animate({left: -1 * (page * $(elem).data('width'))}, 500);

			var start = page * interval, end = (page + 1) * interval;

			$(elem).find('.rr-pagination').each(function () {
				if ($(this).find('> span').length) {
					$(this).find('> span').find('span:eq(0)').html(start + 1).end()
						.find('span:eq(1)').html(end > total ? total : end);
				}
			});
		});
		return true;
	}

	function create(options) {
		if ($(this).data('processed') != undefined) {
			return false;
		}

		var elem = this,
			interval = parseInt(options.column) * parseInt(options.row),
			target = options.target,
			li = target.find('> li:visible').clone().show(); //Find all LI's

		if (!options.force) {
			if (li.length < interval) {
				return false;
			}
		}

		var total = li.length,
			page = 0,
			totalRows = options.row,
			nextClass = (total <= (totalRows * options.column)) ? ' inactive' : '',
			totalpage = Math.ceil(total / (totalRows * options.column));

		$(this).data('interval', interval);

		//Add pagination html fragment.
		if (totalpage > 1) {
			$.each(options.pagination, function (indx, obj) {
				obj = $.extend({}, paginationDefault, obj);
				/**
				 * {
				 * 	type: append|prepend,
				 * 	displayTotal: true|false,
				 * 	prevArrow: true|false,
				 * 	nextArrow: true|false
				 * }
				 */

				var paginationClass = [];

				if (obj.align == 'left') {
					paginationClass.push('pull-left');
				}

				if (options.largeArrow) {
					paginationClass.push('pagination-large');
				}

				var code = '<div class="rr-pagination ' + paginationClass.join(' ') + '">';

				if (obj.displayTotal) {
					code += htmlFragment.displayTotal
						.replace('[[end]]', ((total < options.interval) ? total : totalRows * options.column))
						.replace('[[total]]', total);
				}

				if (obj.prevArrow) {
					code += htmlFragment.prevArrow;
				}

				if (obj.nextArrow) {
					code += htmlFragment.nextArrow.replace('[[className]]', nextClass);
				}

				code += '</div>';

				if (obj.type == 'append') {
					if (typeof obj.selector == 'undefined') {
						$(elem).append(code);
					}
					else {
						$(elem).find(obj.selector).append(code);
					}
				}
				else if (obj.type == 'prepend') {
					if (typeof obj.selector == 'undefined') {
						$(elem).prepend(code);
					}
					else {
						$(elem).find(obj.selector).prepend(code);
					}
				}
			});
		}

		target.wrap('<div>').parent().addClass('pagination-container');

		var width = $(this).find('.pagination-container').outerWidth();

		$(this)
			.data('total', total)
			.data('totalpage', totalpage)
			.data('page', page)
			.data('width', width);

		var divContainer = $('<div>').css({width: width * totalpage}).appendTo(target.parent());

		for (var p = 0; p < totalpage; p++) {
			var ul = $('<ul>').css({width: width});

			for (var indx2 = p * interval; indx2 < (p + 1) * interval; indx2++) {
				ul.append(li.get(indx2));
			}

			ul.appendTo(divContainer);
		}

		//Hide UL
		target.data('processed', true).hide();

		return true;
	}
})(jQuery);