import User from '../models/userModel.js'; // Importation du modèle utilisateur
import bcrypt from 'bcrypt'; // Importation de bcrypt pour le hachage des mots de passe
import jwt from 'jsonwebtoken'; // Importation de jsonwebtoken pour la gestion des tokens JWT
import dotenv from 'dotenv'; // Importation de dotenv pour gérer les variables d'environnement
import transporter from '../config/mailConfig.js'; // Importation du configurateur de transport d'email

dotenv.config(); // Chargement des variables d'environnement

// Fonction pour générer un token d'accès
const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Fonction pour générer un token de rafraîchissement
const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Enregistrement d'un nouvel utilisateur
export const register = async (req, res) => {
  const { name, email, password } = req.body; // Récupération des informations d'inscription
  const hashedPassword = await bcrypt.hash(password, 10); // Hachage du mot de passe

  try {
    const userExists = await User.findOne({ where: { email } }); // Vérification si l'utilisateur existe déjà
    if (userExists) {
      return res.status(400).json({ Error: "Cet e-mail est déjà utilisé." }); // Si l'email existe déjà, renvoi d'une erreur
    }

    // Création de l'utilisateur
    const user = await User.create({ name, email, password: hashedPassword, confirmed: false });

    const token = generateAccessToken({ email, id: user.id }); // Génération du token d'accès
    const refreshToken = generateRefreshToken({ email, id: user.id }); // Génération du token de rafraîchissement
    const url = `http://localhost:5173/confirm/${token}`; // URL de confirmation

    // Envoi de l'email de confirmation
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmez votre inscription',
      html: `Cliquez <a href="${url}">ici</a> pour confirmer votre inscription.`,
    });

    res.status(200).json({ Status: "Success", Message: "Un email de vérification a été envoyé à votre adresse e-mail. Veuillez vérifier votre e-mail pour confirmer votre inscription.", token, refreshToken });
  } catch (error) {
    res.status(500).json({ Error: "Erreur lors de l'enregistrement de l'utilisateur" }); // Gestion des erreurs
  }
};

// Confirmation de l'email
export const confirmEmail = async (req, res) => {
  const token = req.params.token; // Récupération du token de confirmation
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérification et décryptage du token
    const user = await User.findOne({ where: { id: decoded.id, email: decoded.email } }); // Recherche de l'utilisateur

    if (!user) {
      return res.status(400).json({ Error: "Utilisateur non trouvé" }); // Si l'utilisateur n'est pas trouvé, renvoi d'une erreur
    }

    if (user.confirmed) {
      return res.status(200).json({ Status: "AlreadyConfirmed", Message: "Email déjà confirmé" }); // Si l'email est déjà confirmé, renvoi d'un message approprié
    }

    user.confirmed = true; // Confirmation de l'email
    await user.save(); // Sauvegarde de l'état confirmé

    res.status(200).json({ Status: "Success", Message: "Email confirmé avec succès. Vous pouvez maintenant vous connecter." });
  } catch (error) {
    res.status(500).json({ Error: "Erreur lors de la confirmation de l'email" }); // Gestion des erreurs
  }
};

// Connexion de l'utilisateur
export const login = async (req, res) => {
  const { email, password } = req.body; // Récupération des informations de connexion
  try {
    const user = await User.findOne({ where: { email } }); // Recherche de l'utilisateur par email
    if (!user) {
      return res.status(401).json({ Error: "Email incorrect ou non enregistré." }); // Si l'utilisateur n'est pas trouvé, renvoi d'une erreur
    }

    if (!await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ Error: "Mot de passe incorrect." }); // Si le mot de passe est incorrect, renvoi d'une erreur
    }

    if (!user.confirmed) {
      return res.status(401).json({ Error: "Votre email n'a pas été confirmé. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation." }); // Si l'email n'est pas confirmé, renvoi d'une erreur
    }

    const token = generateAccessToken({ id: user.id, email: user.email, name: user.name, role: user.role }); // Génération du token d'accès
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, name: user.name, role: user.role }); // Génération du token de rafraîchissement
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }); // Définition du cookie du token d'accès
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }); // Définition du cookie du token de rafraîchissement

    res.status(200).json({ Status: "Success", Message: "Connexion réussie", user: { name: user.name, id: user.id, role: user.role }, token, refreshToken });
  } catch (error) {
    res.status(500).json({ Error: "Erreur lors de la connexion" }); // Gestion des erreurs
  }
};

// Déconnexion de l'utilisateur
export const logout = (req, res) => {
  res.clearCookie('token'); // Suppression du cookie token
  res.clearCookie('refreshToken'); // Suppression du cookie refreshToken
  res.status(200).json({ Status: "Success", Message: "Déconnexion réussie" });
};

// Rafraîchissement du token
export const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Récupération du token de rafraîchissement
  if (!refreshToken) {
    return res.status(403).json({ error: "Accès refusé, token manquant!" });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Token invalide" });
    }

    const newAccessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name, role: user.role }); // Génération d'un nouveau token d'accès
    res.cookie('token', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }); // Définition du nouveau cookie token
    res.status(200).json({ Status: "Success", Message: "Token rafraîchi", token: newAccessToken });
  });
};

// Vérification de l'authentification de l'utilisateur
export const whoAmI = async (req, res) => {
  const token = req.cookies.token; // Récupération du token
  if (!token) {
    return res.status(401).json({ Status: "Error", Message: "Non authentifié" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ Status: "Error", Message: "Token invalide" });
    }

    const user = await User.findOne({ where: { id: decoded.id } }); // Recherche de l'utilisateur par ID
    if (!user) {
      return res.status(404).json({ Status: "Error", Message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({ Status: "Success", User: user });
  });
};

// Récupération de la liste des utilisateurs
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'] // Récupération des attributs sélectionnés des utilisateurs
    });
    res.status(200).json({ Status: 'Success', Users: users });
  } catch (error) {
    res.status(500).json({ Error: 'Échec de la récupération des utilisateurs' }); // Gestion des erreurs
  }
};
