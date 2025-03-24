const bcrypt = require('bcrypt');
const collection = require('./config');

const loginUser = async (username, password) => {
  try {
    // Check if username exists
    let user = await collection.findOne({ username });

    if (!user) {
      // If username doesn't exist, check if email was input instead
      user = await collection.findOne({ email: username });
      if (!user) {
        throw new Error("username/password incorrect");
      }
    }

    // Check password
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect) {
      throw new Error("password is incorrect");
    }

    return user; // Return user on successful login
  } catch (error) {
    throw error; // Propagate error to be handled by the caller
  }
};

module.exports = { loginUser };