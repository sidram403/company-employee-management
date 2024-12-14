import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'ADMIN') {
      req.user = { role: 'ADMIN', email: 'admin@example.com', fullName: 'Admin' };
    } else {
      const user = await User.findOne({ _id: decoded._id, role: decoded.role });
      if (!user) {
        throw new Error('User not found');
      }
      req.user = { email: user.email, fullName: user.fullName, role: user.role };
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

