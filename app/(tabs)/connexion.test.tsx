import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Connexion from './Connexion';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'fake_token' }),
  })
) as jest.Mock;

describe('Connexion', () => {
  it('affiche un champ mot de passe et un bouton', () => {
    const { getByPlaceholderText, getByText } = render(<Connexion />);

    expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
    expect(getByText('Se connecter')).toBeTruthy();
  });

  it('envoie une requête et affiche une alerte en cas de succès', async () => {
    const { getByPlaceholderText, getByText } = render(<Connexion />);
    const input = getByPlaceholderText('Mot de passe');
    const button = getByText('Se connecter');

    fireEvent.changeText(input, 'monmotdepasse');
    fireEvent.press(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.composteur.cielnewton.fr/login',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
