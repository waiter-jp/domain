import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * NotFoundError
 * @class NotFoundError
 * @extends {WaiterError}
 */
export default class NotFoundError extends WaiterError {
    public readonly entityName: string;

    constructor(entityName: string, message?: string) {
        if (message === undefined || message.length === 0) {
            message = `Not Found: ${entityName}`;
        }

        super(ErrorCode.NotFound, message);

        this.entityName = entityName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
