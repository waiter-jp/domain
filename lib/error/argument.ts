import * as util from 'util';

import WaiterError from '../error';
import ErrorCode from '../errorCode';

/**
 * ArgumentError
 *
 * @class ArgumentError
 * @extends {WaiterError}
 */
export default class ArgumentError extends WaiterError {
    public readonly argumentName: string;

    constructor(argumentName: string, message?: string) {
        if (message === undefined || message.length === 0) {
            message = util.format('Invalid or missing argument supplied: %s', argumentName);
        }

        super(ErrorCode.Argument, message);

        this.argumentName = argumentName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentError.prototype);
    }
}
