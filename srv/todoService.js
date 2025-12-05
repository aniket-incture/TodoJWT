const cds = require("@sap/cds");
const { verifyJWT } = require("../helper/auth");

module.exports = cds.service.impl(function () {

  this.before("*", "Todos", async (req) => {
    console.log("Authenticating request for Todos operation");
    const user = await verifyJWT(req);
    console.log("Authenticated user for Todos operation:", user);
    if (!user) {
      return req.reject(401, "Authentication required");
    }
  });

  this.before("READ", "Todos", async (req) => {
    const user = await verifyJWT(req);
    if (!user || !user.ID) return req.reject(401, "Authentication required");

    if (!req.params || req.params.length === 0) {
        console.log("Filtering Todos for user:", user.ID);
      const userId = user.ID;

      const sel = req.query.SELECT;

      const cond = [{ ref: ["owner_ID"] }, "=", { val: userId }];

      if (!sel.where) {
        sel.where = cond;
      } else {
        sel.where = ["(", sel.where, ")", "and", "(", cond, ")"];
      }
    }

    if (req.params && req.params[0]) {
        console.log("Validating ownership for Todo ID:", req.params[0].ID || req.params[0]);
      const id = req.params[0].ID || req.params[0];

      const tx = cds.tx(req);
      const todo = await tx.run(
        SELECT.one.from("my.todo.Todo").where({ ID: id })
      );
      if (!todo) return req.reject(404, "Todo not found");

      if (todo.owner_ID !== user.ID) {
        return req.reject(403, "Forbidden — not the owner");
      }
    }

  });

  this.before("CREATE", "Todos", async (req) => {
    const user = await verifyJWT(req);
    console.log("Authenticated user in CREATE hook:", req.user);
    req.data.owner_ID = req.user.ID;
    req.data.isDone = false;
    console.log("New Todo item with owner set:", req.data);
  });

  this.before("UPDATE", "Todos", async (req) => {
    const user = await verifyJWT(req);
    if (!user || !user.ID) return req.reject(401, "Authentication required");

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

    const allowedPayload = {};
    if (
      req.data &&
      Object.prototype.hasOwnProperty.call(req.data, "owner_ID")
    ) {
      return req.reject(400, "Updating 'owner_ID' is not allowed.");
    }
    if (req.data && Object.prototype.hasOwnProperty.call(req.data, "title")) {
      allowedPayload.title = req.data.title;
    }
    if (req.data && Object.prototype.hasOwnProperty.call(req.data, "isDone")) {
      allowedPayload.isDone =
        req.data.isDone === true || req.data.isDone === "true";
    }

    if (Object.keys(allowedPayload).length === 0) {
      return req.reject(
        400,
        "Nothing to update — only 'title' or 'isDone' can be updated."
      );
    }

    req.data = allowedPayload;
  });

  this.before("DELETE", "Todos", async (req) => {
    console.log("DELETE operation invoked");
    const user = await verifyJWT(req);
    if (!user || !user.ID) return req.reject(401, "Authentication required");
    const id =
      (req.params && req.params[0] && (req.params[0].ID || req.params[0])) ||
      (req.data && req.data.ID);
    console.log("Todo ID to delete:", id);
    if (!id) return req.reject(400, "Missing entity key");

    const tx = cds.tx(req);
    const todo = await tx.run(
      SELECT.one.from("my.todo.Todo").where({ ID: id })
    );
    console.log("Fetched Todo item for deletion:", todo);
    if (!todo) return req.reject(404, "Todo not found");

    const ownerId = todo.owner_ID || (todo.owner && todo.owner.ID);
    if (ownerId !== user.ID)
      return req.reject(403, "Forbidden — not the owner");

    console.log("Let's delete baby");
  });
});
