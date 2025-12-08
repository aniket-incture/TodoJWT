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
      onInit: function () {
        const oModel = new sap.ui.model.json.JSONModel({
          title: "",
        });

        this.getView().setModel(oModel, "todo");
      },

      onCreateTodo: async function () {
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
          MessageToast.show("Added todo");
        } catch (err) {
          console.error("Unexpected login error:", err);
          MessageBox.error("Unexpected error during creation of todo.");
        } finally {
          oView.setBusy(false);
        }
      },
    });
  }
);
