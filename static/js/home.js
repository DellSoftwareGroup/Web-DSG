$(document).ready(function () {
  $('.featured-products .btn-default').on('click', function () {
    $('.featured-products ul li:nth-child(3) .polaris-divider').attr('style', 'display: block !important');

    for (var i = 3; i < 9; i++) {//hide from child 4
      $('.featured-products ul li').eq(i).toggle();
    }

    $('.featured-products .btn-default').attr('style', 'display: none !important');
  });

  if ($.fn.slidePagination2) {
    resizeHome();
  }
  else {
    $.getScript('/static/library/jQuery/jquery.slidepagination.min.js', function () {
      resizeHome();
    });
  }
});

addResize('resizeHome');

function resizeHome() {
  if (pageWidth >= 992) {//desktop
    $('.featured-products').slidePagination2({
      list: '.screenshot-carousel-list',
      column: 3,
      row: 2,
      random: true,
      pagination: [
        {type: 'append', selector: '.features-headline'},
        {type: 'append', selector: '.screenshot-carousel-wrapper', displayTotal: true}
      ]
    });
  }
  else if (pageWidth >= 768 && pageWidth < 992) {//tablet
    $('.featured-products').slidePagination2({
      list: '.screenshot-carousel-list',
      column: 2,
      row: 2,
      random: true,
      pagination: [
        {type: 'append', selector: '.features-headline'},
        {type: 'append', selector: '.screenshot-carousel-wrapper', displayTotal: true}
      ]
    });
  }
  else if (pageWidth < 768) {//mobile
		var featuredProduct = $('.featured-products');

		featuredProduct.find('.btn-default').attr('style', 'display: block !important');
		featuredProduct.slidePagination2('destroy');
		featuredProduct.find('.screenshot-carousel-list').find('li').show();
		featuredProduct.find('.screenshot-carousel-list').find('li:gt(2)').hide();

    $('.btn-link').removeClass('btn-link').addClass('btn-default');
  }
}