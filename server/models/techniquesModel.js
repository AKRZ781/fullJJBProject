// models/techniquesModel.js
import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Technique = db.define('techniques', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  videoUrl: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'techniques',
  timestamps: false
});

export default Technique;
