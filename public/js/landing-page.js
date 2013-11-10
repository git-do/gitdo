$(function () {

  // Animate Window Scroll
  $("[data-scroll-to]").on("click", function (ev) {
    ev.preventDefault();
    var target = $(this).attr("href");
    $("html, body").stop().animate({
      scrollTop: $(target).offset().top
    }, 800, function () {
      location.hash = target;
    });

  });

});
