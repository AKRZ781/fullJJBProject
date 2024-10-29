import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import fetchMock from 'jest-fetch-mock';
import AdminTechnique from '../AdminTechnique'; // Assurez-vous que le chemin est correct

// Active les mocks pour les appels réseau avant tous les tests
beforeAll(() => {
  fetchMock.enableMocks();
});

// Réinitialise les mocks avant chaque test
beforeEach(() => {
  fetchMock.resetMocks();
});

// Test pour vérifier le fetch des techniques lors du montage du composant
it('fetches techniques on component mount', async () => {
  // Simule une réponse API avec une technique factice
  const fakeTechniques = [{ id: 1, title: 'Technique 1', description: 'Description 1', videoUrl: null }];
  fetchMock.mockResponseOnce(JSON.stringify(fakeTechniques));

  // Affiche le composant AdminTechnique
  render(<AdminTechnique />);

  // Attendre que la technique soit affichée après le montage du composant
  await waitFor(() => expect(screen.getByText('Technique 1')).toBeInTheDocument());

  // Vérifier que l'appel API a été effectué avec la bonne URL
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:5001/api/techniques', { credentials: 'include' });
});

// Test pour ajouter une nouvelle technique
it('adds a new technique', async () => {
  // Simule une réponse API pour l'ajout de technique
  const newTechnique = { id: 2, title: 'Technique 2', description: 'Description 2', videoUrl: null };
  fetchMock.mockResponseOnce(JSON.stringify({ Status: 'Success', Data: newTechnique }));

  render(<AdminTechnique />);

  // Remplir le formulaire
  fireEvent.change(screen.getByLabelText(/Titre/i), { target: { value: 'Technique 2' } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Description 2' } });

  // Simuler la sélection d'un fichier vidéo
  const file = new File(['video'], 'technique.mp4', { type: 'video/mp4' });
  fireEvent.change(screen.getByLabelText(/Vidéo/i), { target: { files: [file] } });

  // Cliquer sur le bouton pour ajouter la technique
  fireEvent.click(screen.getByText(/Ajouter/i));

  // Attendre que la technique soit ajoutée et affichée dans la liste
  await waitFor(() => expect(screen.getByText('Technique 2')).toBeInTheDocument());

  // Vérifier que l'appel API a été effectué avec la bonne URL
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:5001/api/techniques', expect.any(Object));
});
