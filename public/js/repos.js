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
      
      $('#delete-repo-modal').show();

      $('.close-modal').click(function (event) {
        $('#delete-repo-modal').hide();
      });

      $('.confirm-modal').click(function(event) {
        $.ajax({
          url: '/api/repo/' + $this.attr('name'),
          type: 'DELETE',
          success: function () {
            $('#delete-repo-modal').hide();
            $this.removeAttr("checked");
          }
        });
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
          $this.attr("checked", "checked");
        }
      });
    }
  });

});
