import * as util from 'util';

import WaiterError from '../error';
import ErrorCode from '../errorCode';

/**
 * ArgumentNullError
 *
 * @class ArgumentNullError
 * @extends {WaiterError}
 */
export default class ArgumentNullError extends WaiterError {
    public readonly argumentName: string;

    constructor(argumentName: string, message?: string) {
        if (message === undefined || message.length === 0) {
            message = util.format('Missing argument: %s', argumentName);
        }

        super(ErrorCode.Argument, message);

        this.argumentName = argumentName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentNullError.prototype);
    }
}
