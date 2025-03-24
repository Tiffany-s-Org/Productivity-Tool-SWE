import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Using require for the imports instead of ES module imports
const { UserModel } = require('../back-end/login/src/config');
const { loginUser } = require('../back-end/login/src/auth-module');

// Setup MongoDB connection for testing
const dbUri = 'mongodb://localhost:27017/testdb'; // Test DB URI
let userId: string;
let passwordHash: string;

beforeAll(async () => {
  // Connect to MongoDB for testing
  await mongoose.connect(dbUri);

  // Create a user for login tests
  passwordHash = await bcrypt.hash('password123', 10); // Hash the password
  const user = new UserModel({
    username: 'testuser',
    email: 'testuser@example.com',
    password: passwordHash,
  });

  const savedUser = await user.save();
  userId = savedUser._id.toString();
});

afterAll(async () => {
  // Clean up by deleting the test user and closing MongoDB connection
  await UserModel.deleteOne({ _id: userId });
  await mongoose.connection.close();
});

describe('loginUser function', () => {
  it('should successfully login a user with the correct username and password', async () => {
    const user = await loginUser('testuser', 'password123'); // Using the loginUser function
    expect(user).toBeDefined();
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('testuser@example.com');
  });

  it('should throw an error for incorrect username or password', async () => {
    try {
      await loginUser('testuser', 'wrongpassword');
    } catch (error: unknown) {
      // Type assertion to Error type
      const e = error as Error;
      expect(e.message).toBe('password is incorrect');
    }
  });

  it('should throw an error if the username does not exist', async () => {
    try {
      await loginUser('nonexistentuser', 'password123');
    } catch (error: unknown) {
      // Type assertion to Error type
      const e = error as Error;
      expect(e.message).toBe('username/password incorrect');
    }
  });
});
