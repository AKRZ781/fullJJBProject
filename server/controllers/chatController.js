// controllers/chatController.js
import ChatMessage from '../models/chatModel.js'; // Importation du modèle de message de chat
import User from '../models/userModel.js'; // Importation du modèle utilisateur

// Fonction pour récupérer les messages de chat
export const getChatMessages = async (req, res) => {
  try {
    // Récupération de tous les messages de chat, avec les informations sur l'expéditeur
    const messages = await ChatMessage.findAll({
      include: [
        {
          model: User,
          as: 'sender', // Alias pour l'expéditeur
          attributes: ['id', 'name'] // On récupère l'id et le nom de l'expéditeur
        }
      ],
      order: [['createdAt', 'ASC']] // Tri des messages par date de création dans l'ordre croissant
    });
    console.log('Fetched chat messages:', messages);
    // Envoi des messages au client avec un statut de succès
    res.status(200).json({ Status: 'Success', Messages: messages });
  } catch (error) {
    console.error('Failed to fetch chat messages:', error);
    // En cas d'erreur, envoi d'une réponse d'erreur au client
    res.status(500).json({ Error: 'Failed to fetch chat messages' });
  }
};
// Fonction pour créer un nouveau message de chat
export const createChatMessage = async (req, res) => {
  const { message } = req.body; // Récupération du message depuis le corps de la requête
  const sender_id = req.user.id; // Récupération de l'ID de l'utilisateur connecté

  try {
    // Création d'un nouveau message de chat
    const newMessage = await ChatMessage.create({ sender_id, message });
    // Récupération du message créé avec les informations de l'expéditeur
    const messageWithSender = await ChatMessage.findOne({
      where: { id: newMessage.id },
      include: [
        {
          model: User,
          as: 'sender', // Alias pour l'expéditeur
          attributes: ['id', 'name'] // On récupère l'id et le nom de l'expéditeur
        }
      ]
    });

    // Récupération de l'instance de Socket.IO depuis l'application
    const io = req.app.get('io');
    if (io) {
      // Émission du nouveau message de chat à tous les clients connectés
      io.emit('new_chat_message', messageWithSender);
    } else {
      console.error('Failed to get io instance from req.app');
    }

    console.log('Created and emitted new chat message:', messageWithSender);
    // Envoi du message créé au client avec un statut de succès
    res.status(200).json({ Status: 'Success', Message: messageWithSender });
  } catch (error) {
    console.error('Failed to send chat message:', error);
    // En cas d'erreur, envoi d'une réponse d'erreur au client
    res.status(500).json({ Error: 'Failed to send chat message' });
  }
};

// Fonction pour supprimer un message de chat
export const deleteChatMessage = async (req, res) => {
  const { id } = req.params; // Récupération de l'ID du message depuis les paramètres de la requête

  try {
    // Recherche du message à supprimer
    const message = await ChatMessage.findOne({ where: { id } });
    if (!message) {
      console.log('Message not found or not authorized for deletion:', id);
      return res.status(404).json({ Error: 'Message not found or not authorized' });
    }

    // Suppression du message
    await message.destroy();

    // Récupération de l'instance de Socket.IO depuis l'application
    const io = req.app.get('io');
    if (io) {
      // Émission de la suppression du message à tous les clients connectés
      io.emit('message_deleted', id);
    } else {
      console.error('Failed to get io instance from req.app');
    }

    console.log('Deleted message and emitted deletion:', id);
    // Envoi d'une réponse de succès au client
    res.status(200).json({ Status: 'Success', Message: 'Message deleted' });
  } catch (error) {
    console.error('Failed to delete chat message:', error);
    // En cas d'erreur, envoi d'une réponse d'erreur au client
    res.status(500).json({ Error: 'Failed to delete chat message' });
  }
};
