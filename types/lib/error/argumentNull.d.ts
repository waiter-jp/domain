import WaiterError from '../error';
/**
 * ArgumentNullError
 *
 * @class ArgumentNullError
 * @extends {WaiterError}
 */
export default class ArgumentNullError extends WaiterError {
    readonly argumentName: string;
    constructor(argumentName: string, message?: string);
}
