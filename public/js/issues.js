$(function () {

  $('.issue-list li').on("click", function(ev) {
    ev.preventDefault();
    var _this = this;
    $(this).find(".issue-details").slideToggle();
    $(this).toggleClass('open');
  });

});
