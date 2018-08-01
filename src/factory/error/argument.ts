import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * ArgumentError
 * @extends {WaiterError}
 */
export default class ArgumentError extends WaiterError {
    public readonly argumentName: string;

    constructor(argumentName: string, message?: string) {
        let actualMessage = message;
        if (message === undefined || message.length === 0) {
            actualMessage = `Invalid or missing argument supplied: ${argumentName}`;
        }

        super(ErrorCode.Argument, actualMessage);

        this.argumentName = argumentName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentError.prototype);
    }
}
