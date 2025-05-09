"use strict";
(() => {
var exports = {};
exports.id = 353;
exports.ids = [353];
exports.modules = {

/***/ 641:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
function handler(req, res) {
  if (req.method === 'GET') {
    // Return the current status
    res.status(200).json({
      status: 'inactive',
      lastActive: null,
      simulationMode: true,
      autoBoost: false,
      maxTransactionsPerDay: 100,
      transactionsToday: 0,
      requiredSol: 0.5,
      requiredHpepe: 100000
    });
  } else if (req.method === 'POST') {
    // Update the status based on the request body
    const {
      status
    } = req.body;

    if (!status || !['active', 'inactive', 'paused'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status provided'
      });
    } // Return the updated status


    res.status(200).json({
      status,
      lastActive: status === 'active' ? Date.now() : null,
      simulationMode: true,
      autoBoost: false,
      maxTransactionsPerDay: 100,
      transactionsToday: 0,
      requiredSol: 0.5,
      requiredHpepe: 100000
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(641));
module.exports = __webpack_exports__;

})();