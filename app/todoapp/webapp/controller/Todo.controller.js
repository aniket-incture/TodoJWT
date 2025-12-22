sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
  ],
  function (
    Controller,
    MessageToast,
    MessageBox,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter
  ) {
    "use strict";

    return Controller.extend("my.todo.todoapp.controller.Todo", {
      onInit() {
        this.getView().setModel(new JSONModel({ title: "" }), "todo");
      },

      onCreateTodo() {
        const oInput = this.getView().getModel("todo").getData();
        if (!oInput.title) {
          MessageToast.show("Title is required");
          return;
        }

        const oList = this.byId("todoList");
        const oBinding = oList.getBinding("items");

        oBinding
          .create({
            title: oInput.title,
            isDone: false,
          })
          .created()
          .then(() => {
            this.getView().getModel("todo").setData({ title: "" });
            MessageToast.show("Todo added");
          })
          .catch((err) => {
            MessageBox.error(err.message || "Create failed");
          });
      },

      onDeleteTodo(oEvent) {
        const oItem = oEvent.getParameter("listItem");
        const oCtx = oItem.getBindingContext();

        MessageBox.confirm("Delete this todo?", {
          onClose: (action) => {
            if (action === MessageBox.Action.OK) {
              oCtx
                .delete()
                .then(() => {
                  MessageToast.show("Todo deleted");
                })
                .catch((err) => {
                  MessageBox.error(err.message || "Delete failed");
                });
            }
          },
        });
      },

      onFilterChange(oEvent) {
        const key = oEvent.getParameter("key");
        const oBinding = this.byId("todoList").getBinding("items");

        let aFilters = [];
        if (key === "done") {
          aFilters.push(new Filter("isDone", FilterOperator.EQ, true));
        } else if (key === "pending") {
          aFilters.push(new Filter("isDone", FilterOperator.EQ, false));
        }

        oBinding.filter(aFilters);
      },

      onSearchChange(oEvent) {
        const value = oEvent.getParameter("value");
        const oBinding = this.byId("todoList").getBinding("items");

        const aFilters = value
          ? [new Filter("title", FilterOperator.Contains, value)]
          : [];

        oBinding.filter(aFilters);
      },

      onSearchClear() {
        this.byId("todoList").getBinding("items").filter([]);
      },

      onSortChange(oEvent) {
        const key = oEvent.getSource().getSelectedKey();
        const [field, order] = key.split(" ");

        this.byId("todoList")
          .getBinding("items")
          .sort(new Sorter(field, order === "desc"));
      },
  onEditTodo(oEvent) {
  const oItem = oEvent.getSource().getParent().getParent();
  const oCtx = oItem.getBindingContext();

  this._oEditContext = oCtx;

  const oEditModel = new sap.ui.model.json.JSONModel({
    title: oCtx.getProperty("title"),
    isDone: oCtx.getProperty("isDone")
  });

  this.getView().setModel(oEditModel, "edit");

  if (!this._oEditDialog) {
    this._oEditDialog = sap.ui.xmlfragment(
      "my.todo.todoapp.view.EditTodoDialog", // 👈 filename here
      this
    );
    this.getView().addDependent(this._oEditDialog);
  }

  this._oEditDialog.open();
}

,
onSaveEdit() {
  const oData = this.getView().getModel("edit").getData();

  this._oEditContext.setProperty("title", oData.title);
  this._oEditContext.setProperty("isDone", oData.isDone);

  this._oEditDialog.close();
  sap.m.MessageToast.show("Todo updated");
}

,
onCancelEdit() {
  this._oEditDialog.close();
}

    });
  }
);
