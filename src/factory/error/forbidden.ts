import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * ForbiddenError
 * @class ForbiddenError
 * @extends {WaiterError}
 */
export default class ForbiddenError extends WaiterError {
    constructor(message?: string) {
        if (message === undefined || message.length === 0) {
            message = 'Forbidden';
        }

        super(ErrorCode.Forbidden, message);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
