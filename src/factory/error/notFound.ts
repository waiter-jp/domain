import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * NotFoundError
 * @extends {WaiterError}
 */
export default class NotFoundError extends WaiterError {
    public readonly entityName: string;

    constructor(entityName: string, message?: string) {
        let actualMessage = message;
        if (message === undefined || message.length === 0) {
            actualMessage = `Not Found: ${entityName}`;
        }

        super(ErrorCode.NotFound, actualMessage);

        this.entityName = entityName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
