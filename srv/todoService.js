const cds = require('@sap/cds');

const isUUID = s => typeof s === 'string'
  && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

module.exports = cds.service.impl(function () {
  this.before('CREATE', 'Todos', (req) => {
    if (!req.data) return;

    if (!isUUID(req.data.ID)) {
      req.data.ID = cds.utils.uuid();
    }
 
    if (!req.data.createdAt) req.data.createdAt = new Date().toISOString();
  });
});
