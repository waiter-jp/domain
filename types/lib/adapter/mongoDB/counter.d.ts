/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import CounterModel from './mongoose/model/counter';
/**
 * カウンターMongoDBアダプター
 *
 * @class CounterMongoDBAdapter
 */
export default class CounterMongoDBAdapter {
    readonly counterModel: typeof CounterModel;
    constructor(connection: Connection);
}
