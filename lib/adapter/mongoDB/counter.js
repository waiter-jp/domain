"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const counter_1 = require("./mongoose/model/counter");
/**
 * カウンターMongoDBアダプター
 *
 * @class CounterMongoDBAdapter
 */
class CounterMongoDBAdapter {
    constructor(connection) {
        this.counterModel = connection.model(counter_1.default.modelName);
    }
}
exports.default = CounterMongoDBAdapter;
