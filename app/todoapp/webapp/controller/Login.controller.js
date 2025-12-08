sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
  ],
  (Controller, MessageToast, MessageBox, JSONModel) => {
    "use strict";

    return Controller.extend("my.todo.todoapp.controller.Login", {
      onInit: function () {
        const oModel = new sap.ui.model.json.JSONModel({
          email: "",
          password: "",
        });

        this.getView().setModel(oModel, "login");
      },

      onLoginPress: async function () {
        const oView = this.getView();
        const oModel = oView.getModel("login");
        const oData = { ...oModel.getData() };

        if (!oData.email || !oData.password) {
          MessageToast.show("Please fill all the fields");
          return;
        }
        if (oData.password.length < 6) {
          MessageToast.show("Password must be at least 6 characters");
          return;
        }

        oView.setBusy(true);

        try {
          const res = await fetch("/odata/v4/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(oData),
          });

          console.log("login response status:", res.status);

          if (!res.ok) {
            let errMsg = `Login failed (${res.status})`;
            try {
              const errJson = await res.json();
              errMsg =
                errJson?.error?.message?.value ||
                errJson?.error?.message ||
                errJson?.message ||
                errMsg;
            } catch (err) {}

            MessageBox.error(errMsg);
            return;
          }

          const result = await res.json();
          console.log("login success body:", result);

          MessageToast.show("Login successful");
          oModel.setData({ email: "", password: "" });

          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("Todo");
        } catch (err) {
          console.error("Unexpected login error:", err);
          MessageBox.error("Unexpected error during login.");
        } finally {
          oView.setBusy(false);
        }
      },
      
      onGoToRegister: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("Register");
      },
    });
  }
);
