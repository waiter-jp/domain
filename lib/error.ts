/**
 * WaiterError
 *
 * @class WaiterError
 * @extends {Error}
 */
export default class WaiterError extends Error {
    public readonly code: string;

    constructor(code: string, message?: string) {
        super(message);

        this.name = 'WaiterError';
        this.code = code;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, WaiterError.prototype);
    }
}
