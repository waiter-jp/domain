import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * ServiceUnavailableError
 * @class ServiceUnavailableError
 * @extends {WaiterError}
 */
export default class ServiceUnavailableError extends WaiterError {
    constructor(message?: string) {
        if (message === undefined || message.length === 0) {
            message = 'Service unavailable temporarily.';
        }

        super(ErrorCode.ServiceUnavailable, message);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
    }
}
