import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * RateLimitExceededError
 * @class RateLimitExceededError
 * @extends {WaiterError}
 */
export default class RateLimitExceededError extends WaiterError {
    constructor(message?: string) {
        if (message === undefined || message.length === 0) {
            message = 'Rate limit exceeded.';
        }

        super(ErrorCode.RateLimitExceeded, message);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, RateLimitExceededError.prototype);
    }
}
