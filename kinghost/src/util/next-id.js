'use strict';

var nextId = function nextId(tabela) {
  return {
    get: function get(connection, callback) {
      connection.query('SELECT MAX(id) as id FROM ' + tabela, function (err, retorno) {
        if (err) callback(err);

        var id = retorno[0].id;
        callback(null, ++id);
      });
    }
  };
};

module.exports = nextId;