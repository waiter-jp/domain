"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * カウンターsql serverアダプター
 *
 * @class CounterSqlServerAdapter
 */
class CounterSqlServerAdapter {
    constructor(connectionPool) {
        this.connectionPool = connectionPool;
    }
}
exports.default = CounterSqlServerAdapter;
