
import { beforeAll, afterAll } from 'vitest';
import supertest, { Test } from 'supertest';
import TestAgent from 'supertest/lib/agent';

import app from '@src/app';
import UserRepo from '@src/repos/UserRepo';
import { disconnectPrisma } from '@src/config/prisma';


/******************************************************************************
                                    Run
******************************************************************************/

let agent: TestAgent<Test>;

beforeAll(async () => {
  agent = supertest.agent(app);
  await UserRepo.deleteAllUsers();
});

afterAll(async () => {
  await disconnectPrisma();
});


/******************************************************************************
                                    Export
******************************************************************************/

export { agent };
