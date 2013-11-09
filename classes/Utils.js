module.exports = (function () {

  /**
  * Imports
  */

  /**
  * Constructor
  */
  function Utils() {
  }

  /**
  * Instance methods and properties
  */

  Utils.prototype.arrayToObj = function (arr, key) {
    var
      newObj = {},
      i = arr.length,
      item,
      itemKey;
    for (i; i; i -= 1) {
      item = arr[i - 1];
      itemKey = item[key];
      newObj[itemKey] = item;
    }
    return newObj;
  };

  /**
  * Expose
  */
  return Utils;
}());
