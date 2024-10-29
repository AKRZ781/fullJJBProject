// models/userModel.js

// Importation des types de données de Sequelize
import { DataTypes } from 'sequelize';
// Importation de la configuration de la base de données
import db from '../config/db.js';

// Définition du modèle "User" (Utilisateur)
const User = db.define('User', {
  // Champ "id" pour l'identifiant unique de l'utilisateur
  id: {
    type: DataTypes.INTEGER, // Type entier
    primaryKey: true, // Clé primaire
    autoIncrement: true // Auto-incrémentation
  },
  // Champ "name" pour le nom de l'utilisateur
  name: {
    type: DataTypes.STRING(255), // Type chaîne de caractères
    allowNull: false, // Ne peut pas être nul
    charset: 'utf8mb4', // Jeu de caractères
    collate: 'utf8mb4_general_ci' // Collation
  },
  // Champ "email" pour l'email de l'utilisateur
  email: {
    type: DataTypes.STRING(255), // Type chaîne de caractères
    allowNull: false, // Ne peut pas être nul
    unique: true, // Doit être unique dans la table
    charset: 'utf8mb4', // Jeu de caractères
    collate: 'utf8mb4_general_ci' // Collation
  },
  // Champ "password" pour le mot de passe de l'utilisateur
  password: {
    type: DataTypes.STRING(255), // Type chaîne de caractères
    allowNull: false, // Ne peut pas être nul
    charset: 'utf8mb4', // Jeu de caractères
    collate: 'utf8mb4_general_ci' // Collation
  },
  // Champ "confirmed" pour indiquer si l'email de l'utilisateur est confirmé
  confirmed: {
    type: DataTypes.BOOLEAN, // Type booléen
    defaultValue: false, // Valeur par défaut est faux (non confirmé)
    allowNull: true // Peut être nul
  },
  // Champ "role" pour le rôle de l'utilisateur (utilisateur ou administrateur)
  role: {
    type: DataTypes.STRING(255), // Type chaîne de caractères
    defaultValue: 'user', // Valeur par défaut est "user"
    allowNull: true, // Peut être nul
    charset: 'utf8mb4', // Jeu de caractères
    collate: 'utf8mb4_general_ci' // Collation
  }
}, {
  // Nom de la table dans la base de données
  tableName: 'users',
  // Désactiver les timestamps automatiques (createdAt, updatedAt)
  timestamps: false
});

// Exportation du modèle "User" pour l'utiliser dans d'autres parties de l'application
export default User;
