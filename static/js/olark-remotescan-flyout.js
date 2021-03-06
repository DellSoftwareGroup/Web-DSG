addResize(function () {
	if(pageType > 0 && !$('html').hasClass('ie8')) {
		$('#button-flyout').show();
	}
	else {
		$('#button-flyout').hide();
	}
}, true);

$(document).ready(function() {
	var olarkInterval = setInterval(function() {
		var flyout = $('#button-flyout');

		if(typeof olark == 'function') {
			olark('api.box.hide');

			olark('api.chat.onOperatorsAvailable', function () {
				if (!$('html').hasClass('ie8')) {
					flyout.find('> a').css({
						top: flyout.offset().top - flyout.find('> a').offset().top,
						left: -1 * flyout.find('> a').outerHeight()
					});

					flyout.addClass('init');

					$('#button-flyout').on('click', '> a', function() {
						window.open('/Hidden/olark-remotescan.htm', '', 'width=300, height=250');
					});
				}
			});

			olark('api.chat.onOperatorsAway', function () {
				$('#button-flyout').hide();
			});

			clearInterval(olarkInterval);
		}
	}, 10);

	setTimeout(function() {
		clearInterval(olarkInterval);
	}, 5000);
});
