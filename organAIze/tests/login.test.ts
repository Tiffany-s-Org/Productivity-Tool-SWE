/*import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { loginUser, UserModel } from './path-to-your-auth-module'; // Adjust imports accordingly

// Setup MongoDB connection for testing
const dbUri = 'mongodb://localhost:27017/testdb'; // Test DB URI
let userId: string;

beforeAll(async () => {
  // Connect to MongoDB for testing
  await mongoose.connect(dbUri);

  // Create a user for login tests
  const passwordHash = await bcrypt.hash('password123', 10); // Assuming you're hashing passwords
  const user = new UserModel({
    username: 'testuser',
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

describe('User login functionality', () => {
  it('should successfully log in with correct credentials', async () => {
    const credentials = { username: 'testuser', password: 'password123' };
    const loginResult = await loginUser(credentials); // Assuming loginUser is a function you implemented
    
    expect(loginResult).toBeTruthy(); // Adjust this according to your login function's return
    expect(loginResult.user).toBeDefined();
    expect(loginResult.user.username).toBe('testuser');
  });

  it('should fail to log in with incorrect password', async () => {
    const credentials = { username: 'testuser', password: 'wrongpassword' };
    const loginResult = await loginUser(credentials);

    expect(loginResult).toBeFalsy(); // Your login function should return false or null on failure
  });

  it('should fail to log in with a non-existent user', async () => {
    const credentials = { username: 'nonexistentuser', password: 'password123' };
    const loginResult = await loginUser(credentials);

    expect(loginResult).toBeFalsy(); // Your login function should return false or null on failure
  });
});*/
