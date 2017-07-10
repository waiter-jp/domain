"use strict";
/**
 * sql serverクライアント
 *
 * @module
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql = require("mssql");
let pool;
exports.default = () => __awaiter(this, void 0, void 0, function* () {
    if (pool === undefined) {
        pool = yield (new mssql.ConnectionPool({
            user: process.env.SQL_SERVER_USERNAME,
            password: process.env.SQL_SERVER_PASSWORD,
            server: process.env.SQL_SERVER_SERVER,
            database: process.env.SQL_SERVER_DATABASE,
            options: {
                encrypt: true // Use this if you're on Windows Azure
            }
        })).connect();
    }
    return pool;
});
