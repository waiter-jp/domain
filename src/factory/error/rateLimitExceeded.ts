import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * RateLimitExceededError
 * @extends {WaiterError}
 */
export default class RateLimitExceededError extends WaiterError {
    constructor(message?: string) {
        let actualMessage = message;
        if (message === undefined || message.length === 0) {
            actualMessage = 'Rate limit exceeded.';
        }

        super(ErrorCode.RateLimitExceeded, actualMessage);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, RateLimitExceededError.prototype);
    }
}
