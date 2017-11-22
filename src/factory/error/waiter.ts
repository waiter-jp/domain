import ErrorCode from '../errorCode';

/**
 * WaiterError
 * @export
 * @class WaiterError
 * @extends {Error}
 */
export class WaiterError extends Error {
    public readonly reason: ErrorCode;

    constructor(code: ErrorCode, message?: string) {
        super(message);

        this.name = 'WaiterError';
        this.reason = code;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, WaiterError.prototype);
    }
}
