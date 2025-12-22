const cds = require("@sap/cds");

module.exports = cds.service.impl(function () {
  this.before("READ", "Todos", (req) => {
    if (!req.params || req.params.length === 0) {
      req.query.where({ createdBy: req.user.id });
    }
  });

  this.before("CREATE", "Todos", (req) => {
    req.data.isDone = false;
  });
 
  this.before("UPDATE", "Todos", async (req) => {
    const id = req.params?.[0]?.ID ?? req.params?.[0] ?? req.data?.ID;

    if (!id) req.reject(400, "Missing entity key");

    const todo = await SELECT.one.from("my.todo.Todo").where({ ID: id });

    if (!todo) req.reject(404, "Todo not found");

    if (todo.createdBy !== req.user.id) {
      req.reject(403, "Forbidden — not your Todo");
    }

    if ("createdBy" in req.data || "createdAt" in req.data) {
      req.reject(400, "Managed fields cannot be updated");
    }
  });

  this.before("DELETE", "Todos", async (req) => {
    const id = req.params?.[0]?.ID ?? req.params?.[0];

    if (!id) req.reject(400, "Missing entity key");

    const todo = await SELECT.one.from("my.todo.Todo").where({ ID: id });

    if (!todo) req.reject(404, "Todo not found");

    if (todo.createdBy !== req.user.id) {
      req.reject(403, "Forbidden — not your Todo");
    }
  });
});
