const cds = require("@sap/cds");
const { verifyJWT } = require("../helper/auth");

module.exports = cds.service.impl(function () {
  this.before("CREATE", "Todos", async (req) => {
    const user = await verifyJWT(req);
    if (!user || !user.ID) return req.reject(401, "Authentication required");
    req.data.owner_ID = user.ID;
  });

  this.before("UPDATE", "Todos", async (req) => {
    const user = await verifyJWT(req);
    if (!user || !user.ID) return req.reject(401);

    const id =
      (req.params && req.params[0] && (req.params[0].ID || req.params[0])) ||
      (req.data && req.data.ID);
    if (!id) return req.reject(400, "Missing entity key");

    const tx = cds.tx(req);
    const todo = await tx.run(
      SELECT.one.from("my.todo.Todo").where({ ID: id })
    );
    if (!todo) return req.reject(404, "Todo not found");

    const ownerId = todo.owner_ID || (todo.owner && todo.owner.ID);
    if (ownerId !== user.ID)
      return req.reject(403, "Forbidden — not the owner");

    const allowed = {};
    if (req.data && Object.prototype.hasOwnProperty.call(req.data, "title")) {
      allowed.title = req.data.title;
    }

    if (Object.keys(allowed).length === 0) {
      return req.reject(
        400,
        "Nothing to update — only 'title' can be updated."
      );
    }

    req.data = allowed;
  });

 
});
