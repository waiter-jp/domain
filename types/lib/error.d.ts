/**
 * WaiterError
 *
 * @class WaiterError
 * @extends {Error}
 */
export default class WaiterError extends Error {
    readonly code: string;
    constructor(code: string, message?: string);
}
