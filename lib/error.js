"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * WaiterError
 *
 * @class WaiterError
 * @extends {Error}
 */
class WaiterError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'WaiterError';
        this.code = code;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, WaiterError.prototype);
    }
}
exports.default = WaiterError;
