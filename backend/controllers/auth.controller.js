// controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { createToken, setCookie } from '../utils/auth.js';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'adminpassword';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = createToken({ role: 'ADMIN' });
      setCookie(res, token);
      return res.json({ user: { email: ADMIN_EMAIL, fullName: 'Admin', role: 'ADMIN' } });
    }

    // User login
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = createToken({ _id: user._id, role: user.role });
    setCookie(res, token);
    res.json({ user: { email: user.email, fullName: user.fullName, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({ fullName, email, password, role: 'USER' });
    await user.save();

    const token = createToken({ _id: user._id, role: user.role });
    setCookie(res, token);
    res.status(201).json({ user: { email: user.email, fullName: user.fullName, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const me = (req, res) => {
  res.json(req.user);
};
