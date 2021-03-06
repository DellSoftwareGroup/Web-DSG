$(function () {
  addResize('navigationFix', true);

  $('#masthead').find('> nav')
      .on('click', '.tier1 > li > a', function () {
        navigationFix();

        $('div.tier2 .container > div').removeClass('active');
        $(this).parent().find('div.tier2 .container > div').first().addClass('active');
      })
      .on('click', 'div.tier2 .container > div > a', function (e) {
        if ($(this).attr('href') == '#') {
          e.preventDefault();
          $(this).parent().siblings().removeClass('active').end().addClass('active');
        }
      })
      .on('click', '.close', function (e) {
        e.preventDefault();
        $(this).parents('li').removeClass('open');
      });
  $('body').on('subnav.visible', function () {
    if ($('.masthead .main-nav-section ul #products').data('setheight') == undefined) {
      setHeight($('.masthead .main-nav-section ul div.tier2 .tier3 .container .row .first-item'));
      $('.masthead .main-nav-section ul #products').data('setheight', true);
    }
  });
});

function navigationFix() {
  if (pageType > 1) {
    $('.tier1 > li').removeClass('open');//remove any open sub menu
  }
}

function setHeight(elem) {
  var maxHeight = 0;
  elem.each(function () {
    if ($(this).height() > maxHeight) {
      maxHeight = $(this).height();
    }
  });
  elem.css('height', maxHeight);
}