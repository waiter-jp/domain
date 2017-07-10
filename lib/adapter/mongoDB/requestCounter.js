"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestCounter_1 = require("./mongoose/model/requestCounter");
/**
 * パスポート発行依頼カウンターMongoDBアダプター
 *
 * @class RequestCounterMongoDBAdapter
 */
class RequestCounterMongoDBAdapter {
    constructor(connection) {
        this.requestCounterModel = connection.model(requestCounter_1.default.modelName);
    }
}
exports.default = RequestCounterMongoDBAdapter;
