const cds = require("@sap/cds");

module.exports = cds.service.impl(function () {
  this.before("READ", "Todos", async (req) => {
    if (!req.params || req.params.length === 0) {
      req.query.where({ owner_ID: req.user.id });
      return;
    }

    const id = req.params[0].ID || req.params[0];
    if (!id) req.reject(400, "Missing entity key");

    const todo = await SELECT.one.from("my.todo.Todo").where({ ID: id });

    if (!todo) req.reject(404, "Todo not found");
    if (todo.owner_ID !== req.user.id) {
      req.reject(403, "Forbidden — not the owner");
    }
  });

  this.before("CREATE", "Todos", (req) => {
    req.data.owner_ID = req.user.id;
    req.data.isDone = false;
  });

  this.before("UPDATE", "Todos", async (req) => {
    const id =
      (req.params && req.params[0] && (req.params[0].ID || req.params[0])) ||
      req.data?.ID;

    if (!id) req.reject(400, "Missing entity key");

    const todo = await SELECT.one.from("my.todo.Todo").where({ ID: id });

    if (!todo) req.reject(404, "Todo not found");
    if (todo.owner_ID !== req.user.id) {
      req.reject(403, "Forbidden — not the owner");
    }

    const allowedPayload = {};

    if ("owner_ID" in req.data) {
      req.reject(400, "Updating 'owner_ID' is not allowed");
    }

    if ("title" in req.data) {
      allowedPayload.title = req.data.title;
    }

    if ("isDone" in req.data) {
      allowedPayload.isDone =
        req.data.isDone === true || req.data.isDone === "true";
    }

    if (Object.keys(allowedPayload).length === 0) {
      req.reject(
        400,
        "Nothing to update — only 'title' or 'isDone' can be updated"
      );
    }

    req.data = allowedPayload;
  });

  this.before("DELETE", "Todos", async (req) => {
    const id =
      (req.params && req.params[0] && (req.params[0].ID || req.params[0])) ||
      req.data?.ID;

    if (!id) req.reject(400, "Missing entity key");

    const todo = await SELECT.one.from("my.todo.Todo").where({ ID: id });

    if (!todo) req.reject(404, "Todo not found");
    if (todo.owner_ID !== req.user.id) {
      req.reject(403, "Forbidden — not the owner");
    }
  });
});
