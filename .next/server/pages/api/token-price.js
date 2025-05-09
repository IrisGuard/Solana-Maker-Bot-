"use strict";
(() => {
var exports = {};
exports.id = 576;
exports.ids = [576];
exports.modules = {

/***/ 9707:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
function handler(req, res) {
  // Generate random token prices
  const solanaPrice = 150 + (Math.random() * 10 - 5);
  const hpepePrice = 0.00001 + Math.random() * 0.000005; // Return the prices

  res.status(200).json({
    sol: {
      price: solanaPrice,
      change: (Math.random() * 6 - 3).toFixed(2)
    },
    hpepe: {
      price: hpepePrice,
      change: (Math.random() * 10 - 5).toFixed(2)
    }
  });
}

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(9707));
module.exports = __webpack_exports__;

})();