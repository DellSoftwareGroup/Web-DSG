//append off canvas content
getLocalizedContent("LabelBack").done(function (data) {
	$('.site-wrapper').after('<div id="off-canvas"><div class="bg-grey border-b-gray p-10"><a class="off-canvas-back"><i class="glyphicon glyphicon-menu-left"></i><span>' + data.LabelBack + '</span></a></div><div class="off-canvas-content"></div></div>');

	$('#off-canvas').on('click', '.off-canvas-back', function (e) { //off canvas back button
		e.preventDefault();

		$('body').css('left', -1 * pageWidth);
		$('#off-canvas').css('left', '100%');

		$('.site-wrapper').show();

		$('body').animate({left: 0}, 500, function () {
			$('#off-canvas').data('appendElem').remove();
			$('#off-canvas').removeData('appendElem');

			if($('#off-canvas').find('.panel-group-collapsible-xs').length) {
				$('#off-canvas').find('.panel-group-collapsible-xs').each(function() {
					$(this).find('.panel').each(function() {
						$(this).find('.panel-title').find('> a').children().unwrap();
						$(this).find('.panel-body').unwrap();
					});
				});
			}

			$($('#off-canvas').data('target')).html($('#off-canvas').find('.off-canvas-content').children());
			$('body').removeClass('off-canvas-mode');
			$(document).scrollTop($('#off-canvas').data('top'));

			$('body').trigger('offcanvas.hidden');
		});
	});
});

$('body').on('click', '[data-toggle=offcanvas],[data-toggle=show-offcanvas]', function (e) {
	//perform off canvas, Off canvas is only available on mobile device
	if (pageWidth >= 768) {
		return true;
	}

	e.preventDefault();

	var target = ($(this).data('target') === undefined) ? $(this).attr('href') : $(this).data('target'), top = $(document).scrollTop();

	if($(target + '_old').length) {
		target += '_old';
	}

	$('#off-canvas').css('top', top).data('target', target).data('top', top).find('.off-canvas-content').html($(target).children());

	if($(this).data('offcanvas-append')) {
		var appendElem = $($(this).data('offcanvas-append')).clone().children();
		//$('#off-canvas').find('.off-canvas-content').append(appendElem);
		appendElem.insertAfter($('#off-canvas').find('.off-canvas-content'));
		$('#off-canvas').data('appendElem', appendElem);
	}

	$('body').trigger('offcanvas.visible');

	var offCanvasContent = $('#off-canvas').find('.off-canvas-content');

	if ($(target).data('no-border') && $(target).data('no-border') === true) {
		offCanvasContent.addClass('p-0');
	}
	else {
		offCanvasContent.removeClass('p-0');
	}

	$('body').addClass('off-canvas-mode').animate({left: -1 * pageWidth}, 500, function () {
		$('.site-wrapper').hide();
		$('#off-canvas').css('top', 0);
		$(document).scrollTop(0);

		$('body').css('left', 0);
		$('#off-canvas').css('left', 0);

		$(target).trigger('offcanvas-show');

		setTimeout(function () {
			resizeFourColumnFilmstripCarousel('#off-canvas');
			slickPlugin('#off-canvas');
			loadOoyala('#off-canvas');

			if($('#off-canvas').find('.panel-group-collapsible-xs').length) {
				var parentID = getRandomString(8);

				if($('#off-canvas').find('.panel-group-collapsible-xs').attr('id') === undefined) {
					$('#off-canvas').find('.panel-group-collapsible-xs').attr('id', parentID);
				}
				else {
					parentID = $('#off-canvas').find('.panel-group-collapsible-xs').attr('id');
				}

				$('#off-canvas').find('.panel-group-collapsible-xs').each(function() {
					$(this).find('.panel').each(function() {
						var id = getRandomString(8);

						$(this).find('.panel-title').wrapInner('<a data-toggle="collapse" data-parent="#' + parentID + '" href="#' + id + '" aria-expanded="false" class="collapsed">');
						$(this).find('.panel-body').wrap('<div id="' + id + '" class="collapse" aria-expanded="false">');
					});
				});

				//$('#off-canvas').find('.panel').find('.collapse').collapse();
				$('#off-canvas').find('.collapse').collapse({parent: '#'+parentID}).collapse('hide');
			}
		}, 100);
	});
});

//Off canvas resize
addResize(function () {
	if ($('#off-canvas').is(':visible')) {
		$('.site-wrapper').show();

		$('#off-canvas').data('appendElem').remove();
		$('#off-canvas').removeData('appendElem');

		$($('#off-canvas').data('target')).html($('#off-canvas').find('.off-canvas-content').children());
		$('body').removeClass('off-canvas-mode');
	}
	else {
		$('body').find('[data-toggle=show],[data-toggle=show-offcanvas]').each(function () {
			var target = $($(this).data('target'));

			target.addClass(target.data('hidden-class'));
		});
	}
});