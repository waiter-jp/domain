import * as mongoose from 'mongoose';

/**
 * カウンタースキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        key: String, // カウンター単位キー
        count: Number // 何番目
    },
    {
        collection: 'counters',
        capped: <any>{ size: 1024, max: 100 },
        versionKey: false,
        // id: true,
        // read: 'primaryPreferred',
        safe: <any>{ j: 1, w: 'majority', wtimeout: 10000 }
        // timestamps: {
        //     createdAt: 'created_at',
        //     updatedAt: 'updated_at'
        // },
        // toJSON: { getters: true },
        // toObject: { getters: true }
    }
);

schema.index({ key: 1 }, { unique: true });

export default mongoose.model('Counter', schema);
