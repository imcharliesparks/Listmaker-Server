"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jet_validators_1 = require("jet-validators");
const utils_1 = require("jet-validators/utils");
/******************************************************************************
                                 Constants
******************************************************************************/
const DEFAULT_USER_VALS = () => ({
    id: undefined,
    name: undefined,
    email: '',
    created: new Date(),
    updated: new Date(),
});
/******************************************************************************
                                  Setup
******************************************************************************/
// Initialize the "parseUser" function. Require an id/email, allow optional name.
const parseUser = (0, utils_1.parseObject)({
    id: jet_validators_1.isOptionalString,
    name: jet_validators_1.isOptionalString,
    email: jet_validators_1.isNonEmptyString,
    created: jet_validators_1.isOptionalDate,
    updated: jet_validators_1.isOptionalDate,
});
/******************************************************************************
                                 Functions
******************************************************************************/
/**
 * Create a new user object with sensible defaults and validation.
 */
function __new__(user) {
    const retVal = { ...DEFAULT_USER_VALS(), ...user };
    return parseUser(retVal, errors => {
        throw new Error('Setup new user failed ' + JSON.stringify(errors, null, 2));
    });
}
/**
 * Check if the argument is a valid user object for route validation.
 */
function test(arg, errCb) {
    return !!parseUser(arg, errCb);
}
/******************************************************************************
                                Export default
******************************************************************************/
exports.default = {
    new: __new__,
    test,
};
