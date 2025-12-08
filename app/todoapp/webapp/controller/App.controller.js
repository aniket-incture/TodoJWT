sap.ui.define(["sap/ui/core/mvc/Controller"], (BaseController) => {
  "use strict";

  return BaseController.extend("my.todo.todoapp.controller.App", {
    onInit() {},
    onGoToLogin: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("Login");
    },
    onGoToRegister: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("Register");
    },
    onGoToTodo: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("Todo");
    },
  });
});
