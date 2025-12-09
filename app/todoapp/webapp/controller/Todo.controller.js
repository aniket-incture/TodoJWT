sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
  ],
  (Controller, MessageToast, MessageBox, JSONModel) => {
    "use strict";

    return Controller.extend("my.todo.todoapp.controller.Todo", {
      onInit() {
        const oModel = new sap.ui.model.json.JSONModel({
          title: "",
        });

        this.getView().setModel(oModel, "todo");
        this.getView().setModel(new JSONModel({ value: [] }), "todos");

        this.getView().setModel(
          new JSONModel({
            page: 1,
            pageSize: 5,
            totalCount: 0,
          }),
          "pagination"
        );

        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("Todo")
          .attachPatternMatched(this._onRouteMatched, this);
      },
      async onCreateTodo() {
        const oView = this.getView();
        const oModel = oView.getModel("todo");
        const oData = { ...oModel.getData() };

        if (!oData.title) {
          MessageToast.show("Title is required");
          return;
        }

        oView.setBusy(true);

        try {
          const res = await fetch("/odata/v4/todo/Todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(oData),
          });

          console.log("todo response status:", res.status);
          console.log("Response object:", res);
          if (!res.ok) {
            console.log("Response not ok");
            let errMsg = `Todo failed (${res.status})`;
            try {
              const errJson = await res.json();
              errMsg =
                errJson?.error?.message?.value ||
                errJson?.error?.message ||
                errJson?.message ||
                errMsg;
            } catch (err) {
              console.log(err);
            }

            MessageBox.error(errMsg);
            return;
          }

          //   const result = await res.json();
          //   console.log("todo success body:", result);
          oModel.setData({ title: "" });
          if (this.loadTodos) {
            await this.loadTodos();
          }
          MessageToast.show("Added todo");
        } catch (err) {
          console.error("Unexpected login error:", err);
          MessageBox.error("Unexpected error during creation of todo.");
        } finally {
          oView.setBusy(false);
        }
      },
      async _onRouteMatched() {
        await this.loadTodos();
      },
      async loadTodos(page = 1) {
        const oView = this.getView();
        const oTodosModel = oView.getModel("todos");
        console.log("Loading todos...");
        const oPageModel = oView.getModel("pagination");
        const pageSize = oPageModel.getProperty("/pageSize");
        const skip = (page - 1) * pageSize;
        console.log("Page size:", pageSize, "Skip:", skip);
        oView.setBusy(true);

        try {
          const res = await fetch(
            `/odata/v4/todo/Todos?$orderby=createdAt&$top=${pageSize}&$skip=${skip}&$count=true`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          console.log("Fetch todos response status:", res);
          if (!res.ok) {
            MessageBox.error("Failed to load todos");
            return;
          }
          console.log("Fetch todos response ok");
          const data = await res.json();
          console.log("Fetched todos:", data);

          oTodosModel.setData(data);
          oPageModel.setProperty("/totalCount", data["@odata.count"]);
          oPageModel.setProperty("/page", page);
        } catch (err) {
          console.error(err);
          MessageBox.error("Unexpected error while loading todos");
        } finally {
          oView.setBusy(false);
        }
      },
      async onDeleteTodo(oEvent) {
        const oListItem =
          oEvent.getParameter && oEvent.getParameter("listItem");
        if (!oListItem) {
          MessageBox.error("Unable to determine item to delete.");
          return;
        }
        const oCtx =
          oListItem.getBindingContext && oListItem.getBindingContext("todos");
        if (!oCtx) {
          MessageBox.error("No binding context found for item.");
          return;
        }
        const oTodo = oCtx.getObject();
        const sId = oTodo && oTodo.ID;
        if (!sId) {
          MessageBox.error("Missing todo ID");
          return;
        }

        // confirmation wrapped in a promise so await works reliably/ Otherwise it was skipping the confirmation dialog and showing undefined for userChoice
        const userChoice = await new Promise((resolve) => {
          MessageBox.confirm("Delete this todo?", {
            title: "Confirm delete",
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            onClose: resolve,
          });
        });

        console.log("User selected action:", userChoice);
        if (userChoice !== MessageBox.Action.OK) return;

        const oView = this.getView();
        oView.setBusy(true);
        try {
          const url = `/odata/v4/todo/Todos(${encodeURIComponent(
            "'" + sId + "'"
          )})`;
          const res = await fetch(url, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) {
            let errMsg = `Delete failed (${res.status})`;
            try {
              const errJson = await res.json();
              errMsg =
                errJson?.error?.message?.value ||
                errJson?.error?.message ||
                errJson?.message ||
                errMsg;
            } catch (_) {}
            MessageBox.error(errMsg);
            return;
          }

          const oTodosModel = this.getView().getModel("todos");
          const oCurrent = oTodosModel.getData() || { value: [] };
          oCurrent.value = (oCurrent.value || []).filter(
            (item) => item.ID !== sId
          );
          oTodosModel.setData(oCurrent);

          MessageToast.show("Deleted todo");
        } catch (err) {
          console.error("Delete error:", err);
          MessageBox.error("Unexpected error while deleting todo");
        } finally {
          oView.setBusy(false);
        }
      },
      async onEditTodo(oEvent) {
        const oCtx = oEvent.getSource().getBindingContext("todos");
        const oData = oCtx.getObject();

        if (!this._editDialog) {
          this._editDialog = await this.loadFragment({
            name: "my.todo.todoapp.view.EditTodoDialog",
          });
          this.getView().addDependent(this._editDialog);
        }

        const oEditModel = new sap.ui.model.json.JSONModel({
          ID: oData.ID,
          title: oData.title,
          isDone: oData.isDone,
        });

        this.getView().setModel(oEditModel, "edit");

        this._editDialog.open();
      },
      onCancelEdit() {
        this._editDialog.close();
      },
      async onSaveEdit() {
        const oView = this.getView();
        const oEdit = oView.getModel("edit").getData();

        const payload = {
          title: oEdit.title,
          isDone: oEdit.isDone,
        };

        oView.setBusy(true);

        try {
          const url = `/odata/v4/todo/Todos('${oEdit.ID}')`;
          const res = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            let msg = `Update failed (${res.status})`;
            try {
              const err = await res.json();
              msg = err?.error?.message?.value || msg;
            } catch (_) {}
            MessageBox.error(msg);
            return;
          }

          const oTodosModel = this.getView().getModel("todos");
          const items = oTodosModel.getData().value;

          const idx = items.findIndex((i) => i.ID === oEdit.ID);
          if (idx >= 0) {
            items[idx] = { ...items[idx], ...payload };
            oTodosModel.refresh();
          }

          MessageToast.show("Todo updated");
          this._editDialog.close();
        } catch (err) {
          console.error(err);
          MessageBox.error("Unexpected error while updating.");
        } finally {
          oView.setBusy(false);
        }
      },
      onPrevPage() {
        const oPageModel = this.getView().getModel("pagination");
        const page = oPageModel.getProperty("/page");

        if (page > 1) {
          this.loadTodos(page - 1);
        }
      },
      onNextPage() {
        const oPageModel = this.getView().getModel("pagination");
        const page = oPageModel.getProperty("/page");
        const pageSize = oPageModel.getProperty("/pageSize");
        const total = oPageModel.getProperty("/totalCount");

        const maxPage = Math.ceil(total / pageSize);

        if (page < maxPage) {
          this.loadTodos(page + 1);
        }
      },
    });
  }
);
