// login.test.d.ts
import { Model, Document } from 'mongoose';

// Declare the path to the config file using require
const config: {
  UserModel: Model<{ username: string, email: string, password: string } & Document>;
};

export = config;

import * as authModule from '../back-end/login/src/auth-module';
export = authModule;
