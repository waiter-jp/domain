import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * ArgumentError
 * @class ArgumentError
 * @extends {WaiterError}
 */
export default class ArgumentError extends WaiterError {
    public readonly argumentName: string;

    constructor(argumentName: string, message?: string) {
        if (message === undefined || message.length === 0) {
            message = `Invalid or missing argument supplied: ${argumentName}`;
        }

        super(ErrorCode.Argument, message);

        this.argumentName = argumentName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentError.prototype);
    }
}
