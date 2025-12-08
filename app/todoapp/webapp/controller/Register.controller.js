sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
  ],
  (Controller, MessageToast, MessageBox, JSONModel) => {
    "use strict";

    return Controller.extend("my.todo.todoapp.controller.Register", {
      onInit: function () {
        const oModel = new sap.ui.model.json.JSONModel({
          name: "",
          email: "",
          password: "",
        });

        this.getView().setModel(oModel, "register");
      },

      onRegisterPress: async function () {
        const oView = this.getView();
        const oModel = oView.getModel("register");
        const oData = Object.assign({}, oModel.getData());
        if (!oData.name || !oData.email || !oData.password) {
          MessageToast.show("Please fill all the fields");
          return;
        }
        if (oData.password.length < 6) {
          MessageToast.show("Password must be at least 6 characters");
          return;
        }
        console.log("Doing it in register");
        oView.setBusy(true);
        try {
          const res = await fetch("/odata/v4/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(oData),
          });

          console.log("register response status:", res.status);
          console.log("register response", res);

          if (!res.ok) {
            let errMsg = `Registration failed (${res.status})`;
            try {
              const errJson = await res.json();
              errMsg =
                errJson?.error?.message?.value ||
                errJson?.error?.message ||
                errJson?.message ||
                errMsg;
            } catch (e) {
              console.error(
                "Error parsing register error response as JSON:",
                e
              );
            }

            return;
          }

          const result = await res.json();
          console.log("register response body:", result);

          MessageToast.show("Registered successfully");

          oModel.setData({ name: "", email: "", password: "" });
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("Login");
        } catch (err) {
          console.error("Unexpected register error:", err);
          MessageBox.error(
            "Unexpected error during registration. See console."
          );
        } finally {
          oView.setBusy(false);
        }
      },

      onGoToLogin: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("Login");
      },
    });
  }
);
