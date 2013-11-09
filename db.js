module.exports = (function () {
  var DB = {};
  DB.mongo = require("mongojs");
  DB.url = "meltmedia.2013.nodeknockout.com";
  DB.collections = ["users"];
  return DB.mongo.connect(DB.url, DB.collections);
}());
