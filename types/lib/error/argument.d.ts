import WaiterError from '../error';
/**
 * ArgumentError
 *
 * @class ArgumentError
 * @extends {WaiterError}
 */
export default class ArgumentError extends WaiterError {
    readonly argumentName: string;
    constructor(argumentName: string, message?: string);
}
