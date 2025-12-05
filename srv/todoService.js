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

});
