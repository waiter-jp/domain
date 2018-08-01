import ErrorCode from '../errorCode';
import { WaiterError } from './waiter';

/**
 * ArgumentNullError
 * @extends {WaiterError}
 */
export default class ArgumentNullError extends WaiterError {
    public readonly argumentName: string;

    constructor(argumentName: string, message?: string) {
        let actualMessage = message;
        if (message === undefined || message.length === 0) {
            actualMessage = `Missing argument: ${argumentName}`;
        }

        super(ErrorCode.Argument, actualMessage);

        this.argumentName = argumentName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentNullError.prototype);
    }
}
