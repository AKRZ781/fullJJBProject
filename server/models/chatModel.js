// models/chatMessageModel.js
import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import User from './userModel.js'; // Assurez-vous que le chemin est correct

const ChatMessage = db.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'chat_messages',
  timestamps: true // Utilisation des timestamps automatiques (createdAt, updatedAt)
});

ChatMessage.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });

export default ChatMessage;
