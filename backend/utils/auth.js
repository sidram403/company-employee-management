// utils/auth.utils.js
import jwt from 'jsonwebtoken';

export const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

export const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV !== 'development',
  });
};
