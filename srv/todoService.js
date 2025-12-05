const cds = require('@sap/cds');
const { verifyJWT} = require('../helper/auth'); 

module.exports = cds.service.impl(function () {
  
  this.before('*', 'Todos', async (req) => {
    console.log("Authenticating request for Todos operation");
    const user = await verifyJWT(req); 
    console.log("Authenticated user for Todos operation:", user);
    if (!user) {
      return req.reject(401, 'Authentication required');
    }

  });

   this.before('CREATE', 'Todos', (req) => {
  
    if (!req.data.owner) {
      req.data.owner = { ID: req.user.ID };
    } else {
    
      if (req.data.owner.ID && req.data.owner.ID !== req.user.ID) {
        return req.reject(403, 'Cannot create Todo for another user');
      }
    
      if (typeof req.data.owner === 'string' || typeof req.data.owner === 'number') {
        req.data.owner = { ID: req.user.ID }; 
      }
    }
  });
});
