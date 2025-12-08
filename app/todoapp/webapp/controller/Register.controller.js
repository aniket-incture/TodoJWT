sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
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

    onRegisterPress: function () {
      const oData = this.getView().getModel("register").getData();

      console.log("Register Form Data:", oData);
      if (!oData.name || !oData.email || !oData.password) {
        sap.m.MessageToast.show("Please fill all the fields");
        return;
      }
    },
  });
});
