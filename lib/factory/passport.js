"use strict";
/**
 * 許可証ファクトリー
 *
 * @namespace factory/passport
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../error/argument");
const argumentNull_1 = require("../error/argumentNull");
function create(args) {
    if (_.isEmpty(args.client)) {
        throw new argumentNull_1.default('client');
    }
    if (_.isEmpty(args.scope)) {
        throw new argumentNull_1.default('scope');
    }
    if (_.isEmpty(args.issuer)) {
        throw new argumentNull_1.default('issuer');
    }
    if (!_.isNumber(args.issued_place)) {
        throw new argument_1.default('issued_place', 'issued_place should be number');
    }
    return {
        client: args.client,
        scope: args.scope,
        issuer: args.issuer,
        issued_place: args.issued_place
    };
}
exports.create = create;
