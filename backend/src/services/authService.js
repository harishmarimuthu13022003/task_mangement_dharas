const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const workspaceRepository = require('../repositories/workspaceRepository');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

class AuthService {
  async register({ name, email, password, workspaceName }) {
    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('Email is already registered.');
    }

    // 2. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Atomically create workspace and user using a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Workspace
      const workspace = await workspaceRepository.create(
        {
          name: workspaceName,
        },
        tx
      );

      // Create User
      const user = await userRepository.create(
        {
          name,
          email,
          password: hashedPassword,
          workspaceId: workspace.id,
        },
        tx
      );

      return { user, workspace };
    });

    // Return user info (omitting password)
    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
      },
    };
  }

  async login(email, password) {
    // 1. Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // 3. Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId,
        workspaceName: user.workspace.name,
      },
    };
  }

  async getWorkspaceUsers(workspaceId) {
    return userRepository.findAllByWorkspace(workspaceId);
  }
}

module.exports = new AuthService();
