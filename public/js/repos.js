$(function () {

  var username = null;

  $.ajax({
    url: '/api/user',
    type: 'GET',
    success: function (data) {
      username = data.username;
    }
  });

  $('[type="checkbox"]').click(function (event) {
    event.preventDefault();

    var $this = $(this);
    
    if ($this.attr("checked") === "checked") {
      $.ajax({
        url: '/api/repo/' + $this.attr('name'),
        type: 'DELETE',
        success: function () {
          $this.prop("checked", false);
        }
      });
    } else {
      $.ajax({
        url: '/api/repo',
        type: 'POST',
        data: {
          username: username,
          name: $this.attr('name')
        },
        success: function () {
          $this.prop("checked", true);
        }
      });
    }
  });

});
