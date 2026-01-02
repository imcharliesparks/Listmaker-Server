import crypto from 'crypto';

import { prisma } from '@src/config/prisma';
import { IUser } from '@src/models/User';


/******************************************************************************
                                Helpers
******************************************************************************/

function mapUser(row: any): IUser {
  return {
    id: row.id,
    name: row.displayName ?? row.display_name ?? '',
    email: row.email,
    created: row.createdAt ?? row.created_at ?? row.created ?? undefined,
    updated: row.updatedAt ?? row.updated_at ?? row.updated ?? undefined,
  };
}


/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get one user by email.
 */
async function getOne(email: string): Promise<IUser | null> {
  const result = await prisma.user.findUnique({
    where: { email },
  });
  return result ? mapUser(result) : null;
}

/**
 * See if a user with the given id exists.
 */
async function persists(id: string): Promise<boolean> {
  const result = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  return Boolean(result);
}

/**
 * Get all users.
 */
async function getAll(): Promise<IUser[]> {
  const result = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return result.map(mapUser);
}

/**
 * Add one user (upsert on id).
 */
async function add(user: IUser): Promise<IUser> {
  const userId = user.id?.toString().trim() || crypto.randomUUID();
  const displayName = user.name?.trim() || null;
  const email = user.email?.trim();
  if (!email) {
    throw new Error('User email is required to create a user');
  }

  const result = await prisma.user.upsert({
    where: { id: userId },
    update: {
      email,
      displayName,
      photoUrl: null,
      updatedAt: new Date(),
    },
    create: {
      id: userId,
      email,
      displayName,
      photoUrl: null,
    },
  });

  return mapUser(result);
}

/**
 * Update a user.
 */
async function update(user: IUser): Promise<IUser | null> {
  if (!user.id) {
    throw new Error('User id is required for update');
  }
  const result = await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.email ?? undefined,
      displayName: user.name ?? undefined,
      updatedAt: new Date(),
    },
  });

  return result ? mapUser(result) : null;
}

/**
 * Delete one user.
 */
async function delete_(id: string): Promise<void> {
  if (!id) {
    throw new Error('User id is required for delete');
  }
  await prisma.user.delete({ where: { id } });
}


// **** Unit-Tests Only **** //

/**
 * Delete every user record.
 */
async function deleteAllUsers(): Promise<void> {
  await prisma.user.deleteMany();
}

/**
 * Insert multiple users.
 */
async function insertMult(
  users: IUser[] | readonly IUser[],
): Promise<IUser[]> {
  const inserted: IUser[] = [];
  for (const user of users) {
    const nextUser = { ...user };
    if (!nextUser.id) {
      nextUser.id = crypto.randomUUID();
    }
    const result = await prisma.user.upsert({
      where: { id: nextUser.id },
      update: {
        email: nextUser.email,
        displayName: nextUser.name ?? null,
        photoUrl: null,
        updatedAt: new Date(),
      },
      create: {
        id: nextUser.id,
        email: nextUser.email,
        displayName: nextUser.name ?? null,
        photoUrl: null,
      },
    });
    inserted.push(mapUser(result));
  }
  return inserted;
}


/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getOne,
  persists,
  getAll,
  add,
  update,
  delete: delete_,
  deleteAllUsers,
  insertMult,
} as const;

