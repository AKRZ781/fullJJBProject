import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

export const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;
  if (!token) {
    console.log('Access denied, token missing!');
    return res.status(403).json({ error: "Access denied, token missing!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        console.log('Token expired:', err);
        if (!refreshToken) {
          return res.status(401).json({ error: "Token expired" });
        }

        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          const user = await User.findByPk(decoded.id);
          if (!user) {
            return res.status(401).json({ error: "User not found" });
          }
          const newToken = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
          res.cookie('token', newToken, { httpOnly: true });
          const newUser = jwt.verify(newToken, process.env.JWT_SECRET);
          req.user = newUser;
          next();
        } catch (refreshErr) {
          console.log('Error refreshing token:', refreshErr);
          return res.status(401).json({ error: "Invalid refresh token" });
        }
      } else {
        console.log('Invalid token:', err);
        return res.status(401).json({ error: "Invalid token" });
      }
    } else {
      console.log('Token verified, user:', user);
      req.user = user;
      next();
    }
  });
};
