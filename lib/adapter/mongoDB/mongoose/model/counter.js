"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
/**
 * カウンタースキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    key: String,
    count: Number // 何番目
}, {
    collection: 'counters',
    capped: { size: 1024, max: 100 },
    versionKey: false,
    // id: true,
    // read: 'primaryPreferred',
    safe: { j: 1, w: 'majority', wtimeout: 10000 }
    // timestamps: {
    //     createdAt: 'created_at',
    //     updatedAt: 'updated_at'
    // },
    // toJSON: { getters: true },
    // toObject: { getters: true }
});
schema.index({ key: 1 }, { unique: true });
exports.default = mongoose.model('Counter', schema);
