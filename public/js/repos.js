(function () {

  /**
  * Constructor
  */
  function RepoManager() {
    this.initVars();
    this.logIn();
    this.setBinds();
  }

  /**
  * Instance methods and properties
  */

  // Init vars
  RepoManager.prototype.initVars = function () {
    this.username = null;
    this.$body = $("body");
    this.$deleteRepoModal = $("#delete-repo-modal");
  };

  // Log in
  RepoManager.prototype.logIn = function () {
    var self = this;
    return $.ajax({
      url: "/api/user",
      type: "GET",
      success: function (data) {
        self.username = data.username;
      }
    });
  };

  // Set binds
  RepoManager.prototype.setBinds = function () {
    var self = this;
    this.$body
      .on("click", "[type='checkbox']", this.handleCheckbox.bind(this))
      .on("click", ".close-modal", this.closeModal.bind(this))
      .on("click", ".confirm-modal", function (ev) {
        ev.preventDefault();
        self.deleteRepo().done(function () {
          self.closeModal();
          self.updateView();
        });
      });
  };

  // Handle checkbox
  RepoManager.prototype.handleCheckbox = function (ev) {
    ev.preventDefault();

    var $checkbox;
    if (this.username) {
      $checkbox = $(ev.currentTarget);
      this.$checkbox = $checkbox;
      this.repo = $checkbox.attr("name");
      this.state = $checkbox.attr("checked") ? "on" : "off";
      if (this.state === "on") {
        this.showModal();
      } else {
        this.addRepo();
      }
    }
  };

  // Show modal
  RepoManager.prototype.showModal = function () {
    this.$deleteRepoModal.show();
  };

  // Close modal
  RepoManager.prototype.closeModal = function () {
    this.$deleteRepoModal.hide();
  };

  // Add repo
  RepoManager.prototype.addRepo = function () {
    var self = this;
    return $.ajax({
      url: "/api/repo",
      type: "POST",
      data: {
        username: this.username,
        name: this.repo
      },
      success: function () {
        self.updateView();
      }
    });
  };

  // Delete repo
  RepoManager.prototype.deleteRepo = function () {
    var self = this;
    return $.ajax({
      url: "/api/repo/" + this.repo,
      type: "DELETE"
    });
  };

  // Update view
  RepoManager.prototype.updateView = function () {
    if (this.state === "on") {
      this.$checkbox.removeAttr("checked");
    } else {
      this.$checkbox.attr("checked", "checked");
    }
  };

  // Expose
  $(function () {
    var repoManager = new RepoManager();
  });
}());
