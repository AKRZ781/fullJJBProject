import Technique from '../models/techniquesModel.js';
import { body, validationResult } from 'express-validator';
import path from 'path';

// Récupérer toutes les techniques
const getAllTechniques = async (req, res) => {
  try {
    const techniques = await Technique.findAll();
    res.status(200).json(techniques);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de la table techniques:', error);
    res.status(500).json({ Error: "Erreur lors de la récupération des données du serveur" });
  }
};

// Récupérer une technique par ID
const getTechniqueById = async (req, res) => {
  const id = req.params.id;
  try {
    const technique = await Technique.findByPk(id);
    if (technique) {
      res.status(200).json(technique);
    } else {
      res.status(404).json({ Error: "Technique non trouvée" });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données de la table techniques:', error);
    res.status(500).json({ Error: "Erreur lors de la récupération des données du serveur" });
  }
};

// Créer une nouvelle technique avec validation et sanitisation
const createTechnique = [
  body('title').isString().trim().escape().notEmpty().withMessage('Le titre est requis.'),
  body('description').isString().trim().escape().notEmpty().isLength({ max: 1000 }).withMessage('La description doit contenir au maximum 1000 caractères.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;
    const videoUrl = req.file ? `/video/${req.file.filename}` : null; // Chemin relatif pour le frontend
    
    try {
      const newTechnique = await Technique.create({ title, description, videoUrl });
      res.status(200).json({ Status: "Success", Message: "Technique ajoutée avec succès", Data: newTechnique });
    } catch (error) {
      console.error('Erreur lors de l\'insertion des données dans la table techniques:', error);
      res.status(500).json({ Error: "Erreur lors de l'insertion des données dans la base de données" });
    }
  }
];

// Mettre à jour une technique par ID avec validation et sanitisation
const updateTechnique = [
  body('title').optional().isString().trim().escape().notEmpty().withMessage('Le titre est requis.'),
  body('description').optional().isString().trim().escape().notEmpty().isLength({ max: 1000 }).withMessage('La description doit contenir au maximum 1000 caractères.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description } = req.body;
    const videoUrl = req.file ? `/video/${req.file.filename}` : undefined; // Chemin relatif pour le frontend

    try {
      const technique = await Technique.findByPk(id);
      if (technique) {
        // Mise à jour des champs
        technique.title = title !== undefined ? title : technique.title;
        technique.description = description !== undefined ? description : technique.description;
        if (videoUrl !== undefined) technique.videoUrl = videoUrl;

        await technique.save(); // Sauvegarde des modifications
        res.status(200).json({ Status: "Success", Message: "Technique mise à jour avec succès", Data: technique });
      } else {
        res.status(404).json({ Error: "Technique non trouvée" });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la technique:', error);
      res.status(500).json({ Error: "Erreur lors de la mise à jour de la technique" });
    }
  }
];

// Supprimer une technique par ID
const deleteTechnique = async (req, res) => {
  const id = req.params.id;
  try {
    const technique = await Technique.findByPk(id);
    if (technique) {
      await technique.destroy();
      res.status(200).json({ Status: "Success", Message: "Technique supprimée avec succès" });
    } else {
      res.status(404).json({ Error: "Technique non trouvée" });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la technique:', error);
    res.status(500).json({ Error: "Erreur lors de la suppression de la technique" });
  }
};

export { getAllTechniques, getTechniqueById, createTechnique, updateTechnique, deleteTechnique };
