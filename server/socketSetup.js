import { Server } from 'socket.io'; // Importation de la classe Server de Socket.io
import jwt from 'jsonwebtoken'; // Importation de jsonwebtoken pour la gestion des tokens JWT
import User from './models/userModel.js'; // Importation du modèle User
import Message from './models/chatModel.js'; // Importation du modèle Message

const setupSocket = (server) => {
  // Création de l'instance Socket.io en utilisant le serveur HTTP
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Origine autorisée pour les requêtes CORS
      methods: ["GET", "POST"], // Méthodes HTTP autorisées
      credentials: true // Autorisation de l'envoi de cookies
    }
  });

  // Middleware pour authentifier les sockets
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // Récupération du token JWT depuis la requête de handshake
    if (!token) {
      console.log('No token provided');
      return next(new Error("Authentication error: No token provided")); // Erreur si le token est absent
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET); // Vérification du token JWT
      console.log('User authenticated:', user);
      socket.userId = user.id; // Ajout de l'ID utilisateur au socket
      next(); // Passage à l'étape suivante du middleware
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.log('Token expired, attempting to refresh');
        const refreshToken = socket.handshake.auth.refreshToken; // Récupération du refresh token
        if (refreshToken) {
          try {
            const newToken = await refreshJwtToken(refreshToken); // Tentative de rafraîchir le token
            socket.emit('new_token', newToken); // Envoi du nouveau token au client
            const user = jwt.verify(newToken, process.env.JWT_SECRET); // Vérification du nouveau token
            socket.userId = user.id;
            next();
          } catch (refreshErr) {
            console.log('Error refreshing token:', refreshErr);
            return next(new Error("Authentication error: Invalid token")); // Erreur lors du rafraîchissement du token
          }
        } else {
          return next(new Error("Authentication error: No refresh token provided")); // Erreur si le refresh token est absent
        }
      } else {
        console.log('Invalid token:', err);
        return next(new Error("Authentication error: Invalid token")); // Erreur si le token est invalide
      }
    }
  });

  // Gestion des événements de connexion
  io.on('connection', (socket) => {
    console.log('A user connected, socket.id:', socket.id);

    // Gestion de l'événement "new_message" pour les nouveaux messages de chat
    socket.on('new_message', async (messageData) => {
      console.log('Received new message:', messageData);
      const { userId, message } = messageData;
      try {
        const newMessage = await Message.create({ sender_id: userId, message }); // Création d'un nouveau message
        const user = await User.findByPk(userId); // Récupération de l'utilisateur
        const messageWithSender = { ...newMessage.toJSON(), sender: { id: user.id, name: user.name } }; // Ajout des informations de l'expéditeur au message

        console.log('Emitting new chat message:', messageWithSender);
        io.emit('new_chat_message', messageWithSender); // Émission du nouveau message à tous les clients connectés
      } catch (error) {
        console.error('Error creating message:', error);
      }
    });

    // Gestion de l'événement "delete_message" pour la suppression des messages de chat
    socket.on('delete_message', async (messageId) => {
      console.log('Received request to delete message:', messageId);
      try {
        await Message.destroy({ where: { id: messageId } }); // Suppression du message
        console.log('Message deleted:', messageId);
        io.emit('message_deleted', messageId); // Émission de l'événement de suppression à tous les clients connectés
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    // Gestion de l'événement de déconnexion
    socket.on('disconnect', () => {
      console.log(`User disconnected, socket.id: ${socket.id}`);
    });

    // Gestion des erreurs du socket
    socket.on('error', (err) => {
      console.error('Socket encountered error:', err.message, ' closing socket');
      socket.disconnect(); // Déconnexion du socket en cas d'erreur
    });
  });

  return io; // Retour de l'instance Socket.io
};

// Fonction pour rafraîchir le token JWT
const refreshJwtToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); // Vérification du refresh token
    const newToken = jwt.sign({ id: decoded.id, email: decoded.email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Création d'un nouveau token
    return newToken;
  } catch (err) {
    throw new Error('Invalid refresh token'); // Erreur si le refresh token est invalide
  }
};

export default setupSocket; // Exportation de la fonction setupSocket
