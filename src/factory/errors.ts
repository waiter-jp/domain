/**
 * errors
 * @namespace errors
 */

import ArgumentError from './error/argument';
import ArgumentNullError from './error/argumentNull';
import NotFoundError from './error/notFound';
import RateLimitExceededError from './error/rateLimitExceeded';
import ServiceUnavailableError from './error/serviceUnavailable';
import { WaiterError } from './error/waiter';

export {
    ArgumentError as Argument,
    ArgumentNullError as ArgumentNull,
    NotFoundError as NotFound,
    RateLimitExceededError as RateLimitExceeded,
    ServiceUnavailableError as ServiceUnavailable,
    WaiterError as Waiter
};
