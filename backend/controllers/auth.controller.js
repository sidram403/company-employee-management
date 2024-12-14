import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'adminpassword';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'ADMIN' }, process.env.JWT_SECRET);
      res.cookie('token', token, { 
        httpOnly: true, 
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 ,
        secure: process.env.NODE_ENV !=="development"
      });
      return res.json({ user: { email: ADMIN_EMAIL, fullName: 'Admin', role: 'ADMIN' } });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.cookie('token', token, { 
      httpOnly: true, 
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 ,
      secure: process.env.NODE_ENV !=="development"
    });
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

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.cookie('token', token, { 
      httpOnly: true, 
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 ,
      secure: process.env.NODE_ENV !=="development"
    });
    res.status(201).json({ user: { email: user.email, fullName: user.fullName, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const me = async (req, res) => {
  res.json(req.user);
};

