const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {
  this.before('CREATE', 'Todos', (req) => {
    if (!req.data) return;

  });
});
