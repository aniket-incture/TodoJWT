sap.ui.define([], function () {
    "use strict";

    return {
        todoStatusClass: function (isDone) {
            return isDone ? "todoDone" : "todoPending";
        }
    };
});
