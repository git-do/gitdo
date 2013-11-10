(function($){

  $(function () {

    // Issue List Item Slide Toggle
    $('.issue-list .list-item-header').on("click", function(ev) {
      ev.preventDefault();
      var
        $this = $(this),
        $li = $this.closest("li"),
        _this = this;
      if (!$li.hasClass("removed")) {
        $li.find(".issue-details").slideToggle();
        $li.toggleClass('open');
      }
    });

    // Issue Tabs
    $("[data-tab-content]").on("click", function (ev) {
      if (this === ev.target) {
        ev.preventDefault();

        // Get Selected tab-content
        var targetSection = $(this).data("tab-content");
        
        // Remove all active classes
        $("[data-tab-content]").removeClass("active");

        // Add active class to target
        $("[data-tab-content=" + targetSection + "]").each(function () {
          $(this).addClass("active");
        });
      }
    });

    // Select open issues first
    $("[data-tab-content=open-issues]").trigger("click");

    // "mark as resolved" button functionality
    $(".resolve-btn").click(function (event) {
      event.preventDefault();
      
      var $this = $(this);

      $.ajax({
        url: "/api/issue",
        type: "POST",
        data: {
          number: $this.attr("data-number"),
          repo: $this.attr("data-repo"),
          state: "closed"
        },
        success: function () {
          var $li = $this.closest("li");
          $li
            .removeClass("open")
            .addClass("removed")
            .find(".issue-details")
            .slideToggle();
        }
      });
    });

    // "re-open" button functionality
    $(".reopen-btn").click(function (event) {
      event.preventDefault();
      
      var $this = $(this);

      $.ajax({
        url: "/api/issue",
        type: "POST",
        data: {
          number: $this.attr("data-number"),
          repo: $this.attr("data-repo"),
          state: "open"
        },
        success: function () {
          var $li = $this.closest("li");
          $li
            .removeClass("open")
            .addClass("removed")
            .find(".issue-details")
            .slideToggle();
        }
      });
    });

  });

}(jQuery));
