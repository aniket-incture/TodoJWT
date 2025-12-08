sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
  "use strict";

  return Controller.extend("my.todo.todoapp.controller.Login", {
    onInit: function () {
      const oModel = new sap.ui.model.json.JSONModel({
        email: "",
        password: "",
      });

      this.getView().setModel(oModel, "login");
    },

    onLoginPress: function () {
      const oData = this.getView().getModel("login").getData();

      if (!oData.email || !oData.password) {
        sap.m.MessageToast.show("Please fill all the fields");
        return;
      }
      if(oData.password.length<6){
        sap.m.MessageToast.show("Password must be at least 6 characters long");
        return;
      }
      console.log("Logging in with", oData);
      const oModel = this.getView().getModel("login");
       oModel.setData({ email: "", password: "" });

    },
    onGoToRegister:function(){
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("Register");
    }
  });
});
