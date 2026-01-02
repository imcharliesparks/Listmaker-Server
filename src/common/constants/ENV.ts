import jetEnv, { num } from 'jet-env';

import { NodeEnvs } from '.';


/******************************************************************************
                                 Helpers
******************************************************************************/

const isEnumVal =
  <T extends Record<string, string | number>>(enm: T) =>
    (arg: unknown): arg is T[keyof T] =>
      Object.values(enm).includes(arg as T[keyof T]);


/******************************************************************************
                                 Setup
******************************************************************************/

const ENV = jetEnv({
  NodeEnv: isEnumVal(NodeEnvs),
  Port: num,
});


/******************************************************************************
                            Export default
******************************************************************************/

export default ENV;
