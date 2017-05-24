import { Connection } from 'mongoose';
import CounterModel from './mongoose/model/counter';

/**
 * カウンターMongoDBアダプター
 *
 * @class CounterMongoDBAdapter
 */
export default class CounterMongoDBAdapter {
    public readonly counterModel: typeof CounterModel;

    constructor(connection: Connection) {
        this.counterModel = connection.model(CounterModel.modelName);
    }
}
