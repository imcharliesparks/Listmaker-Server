import { isOptionalDate, isOptionalString, isNonEmptyString } from 'jet-validators';
import { parseObject, TParseOnError } from 'jet-validators/utils';

import { IModel } from './common/types';


/******************************************************************************
                                 Types
******************************************************************************/

export interface IUser extends IModel {
  id?: string;
  name?: string;
  email: string;
}


/******************************************************************************
                                 Constants
******************************************************************************/

const DEFAULT_USER_VALS = (): IUser => ({
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
const parseUser = parseObject<IUser>({
  id: isOptionalString,
  name: isOptionalString,
  email: isNonEmptyString,
  created: isOptionalDate,
  updated: isOptionalDate,
});


/******************************************************************************
                                 Functions
******************************************************************************/

/**
 * Create a new user object with sensible defaults and validation.
 */
function __new__(user?: Partial<IUser>): IUser {
  const retVal = { ...DEFAULT_USER_VALS(), ...user };
  return parseUser(retVal, errors => {
    throw new Error('Setup new user failed ' + JSON.stringify(errors, null, 2));
  });
}

/**
 * Check if the argument is a valid user object for route validation.
 */
function test(arg: unknown, errCb?: TParseOnError): arg is IUser {
  return !!parseUser(arg, errCb);
}


/******************************************************************************
                                Export default
******************************************************************************/

export default {
  new: __new__,
  test,
} as const;
