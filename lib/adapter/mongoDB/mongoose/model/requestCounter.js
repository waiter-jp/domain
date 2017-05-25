"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * パスポート発行依頼カウンタースキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    issuer: String,
    scope: String,
    number_of_requests: Number // 依頼回数
}, {
    collection: 'request_counters',
    capped: false,
    versionKey: false,
    // id: true,
    read: 'primaryPreferred',
    safe: safe,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
    // toJSON: { getters: true },
    // toObject: { getters: true }
});
schema.index({ issuer: 1, scope: 1 }, { unique: true });
exports.default = mongoose.model('RequestCounter', schema);
