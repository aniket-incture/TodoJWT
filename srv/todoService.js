const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {
  
  this.before('*', 'Todos', (req) => {
    if (!req.user || !req.user.id) {
      return req.reject(401, 'Authentication required');
    }
    
  });

  this.before(['UPDATE','DELETE'], 'Todos', async (req) => {
    const tx = cds.tx(req);
    const id = req.params?.[0] || req.data?.ID;
    const todo = await tx.run(SELECT.one.from('my.todo.Todo').where({ ID: id }));
    if (!todo) return req.reject(404);
    const ownerId = todo.owner_ID || (todo.owner && todo.owner.ID);
    if (ownerId !== req.user.id) return req.reject(403, 'Forbidden');
  });
});
