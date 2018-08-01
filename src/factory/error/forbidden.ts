import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * ForbiddenError
 * @extends {WaiterError}
 */
export default class ForbiddenError extends WaiterError {
    constructor(message?: string) {
        let actualMessage = message;
        if (message === undefined || message.length === 0) {
            actualMessage = 'Forbidden';
        }

        super(ErrorCode.Forbidden, actualMessage);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
