import express from 'express';
import { getAllTechniques, getTechniqueById, createTechnique, deleteTechnique } from '../controllers/techniquesController.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.get('/', getAllTechniques);
router.get('/:id', getTechniqueById);
router.post('/', upload.single('video'), createTechnique); // Utilisation de multer pour gérer le téléchargement du fichier
router.delete('/:id', deleteTechnique);

export default router;
