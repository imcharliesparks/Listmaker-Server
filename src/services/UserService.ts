import { RouteError } from '@src/common/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

import UserRepo from '@src/repos/UserRepo';
import { IUser } from '@src/models/User';


/******************************************************************************
                                Constants
******************************************************************************/

export const USER_NOT_FOUND_ERR = 'User not found';


/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get all users.
 */
function getAll(): Promise<IUser[]> {
  return UserRepo.getAll();
}

/**
 * Add one user.
 */
function addOne(user: IUser): Promise<IUser> {
  return UserRepo.add(user);
}

/**
 * Update one user.
 */
async function updateOne(user: IUser): Promise<IUser> {
  if (!user.id) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'User id is required',
    );
  }
  const persists = await UserRepo.persists(user.id);
  if (!persists) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      USER_NOT_FOUND_ERR,
    );
  }
  // Return user
  const updated = await UserRepo.update(user);
  if (!updated) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      USER_NOT_FOUND_ERR,
    );
  }
  return updated;
}

/**
 * Delete a user by their id.
 */
async function _delete(id: string): Promise<void> {
  if (!id) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'User id is required',
    );
  }
  const persists = await UserRepo.persists(id);
  if (!persists) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      USER_NOT_FOUND_ERR,
    );
  }
  // Delete user
  return UserRepo.delete(id);
}


/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getAll,
  addOne,
  updateOne,
  delete: _delete,
} as const;
