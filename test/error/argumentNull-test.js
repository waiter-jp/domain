"use strict";
/**
 * ArgumentNullErrorテスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const error_1 = require("../../lib/error");
const argumentNull_1 = require("../../lib/error/argumentNull");
describe('引数なしエラー', () => {
    it('正しくインスタンス化できる', () => __awaiter(this, void 0, void 0, function* () {
        const argumentName = 'testname';
        const message = 'test message';
        const argumentError = new argumentNull_1.default(argumentName, message);
        assert(argumentError instanceof Error);
        assert.equal(argumentError.argumentName, argumentName);
        assert.equal(argumentError.message, message);
        assert.equal(argumentError.name, error_1.default.name);
        assert.equal(typeof argumentError.stack, 'string');
    }));
    it('メッセージを指定しなくても、正しくインスタンス化できる', () => __awaiter(this, void 0, void 0, function* () {
        const argumentName = 'testname';
        const argumentError = new argumentNull_1.default(argumentName);
        assert(argumentError instanceof Error);
        assert.equal(argumentError.argumentName, argumentName);
        assert.equal(argumentError.name, error_1.default.name);
        assert.equal(typeof argumentError.message, 'string');
        assert.equal(typeof argumentError.stack, 'string');
    }));
});
