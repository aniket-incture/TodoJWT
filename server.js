
const cds = require('@sap/cds');
const cookieParser = require('cookie-parser');

cds.on('bootstrap', (app) => {
  
  app.use(cookieParser());

});

module.exports = cds.server;
