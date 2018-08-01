import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * ServiceUnavailableError
 * @extends {WaiterError}
 */
export default class ServiceUnavailableError extends WaiterError {
    constructor(message?: string) {
        let actualMessage = message;
        if (message === undefined || message.length === 0) {
            actualMessage = 'Service unavailable temporarily.';
        }

        super(ErrorCode.ServiceUnavailable, actualMessage);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
    }
}
