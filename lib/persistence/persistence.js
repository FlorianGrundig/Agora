"use strict";

var path = require('path');

module.exports = function (location) {
  var dir = path.join(__dirname, location);

  return {
    store: require('store')(dir),

    list: function (callback) {
      this.store.list(function (err, result) {
        if (err) {
          throw err;
        }
        callback(result);
      });
    },

    getById: function (id, callback) {
      this.list(function (results) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].id === id) {
            return callback(results[i]);
          }
        }
        callback();
      });
    },

    save: function (object) {
      this.store.add(object, function (err) {
        if (err) {
          throw err;
        }
      });
    }
  };

};