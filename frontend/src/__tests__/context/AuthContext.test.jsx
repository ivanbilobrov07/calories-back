import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';

jest.mock('../../api/users', () => ({
  getProfile: jest.fn(),
}));

jest.mock('../../api/auth', () => ({
  logout: jest.fn(),
  register: jest.fn(),
  login: jest.fn(),
}));

const { getProfile } = require('../../api/users');
const { logout: apiLogout } = require('../../api/auth');
const { AuthProvider, useAuth } = require('../../context/AuthContext');

function TestConsumer() {
  const { user, loading, login, logout, refreshUser } = useAuth();
  if (loading) return <div>Loading</div>;
  return (
    <div>
      <span data-testid="user">{user?.email ?? 'no user'}</span>
      <button onClick={() => login({ email: 'new@test.com' })}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshUser}>Refresh</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => jest.clearAllMocks());

  test('shows loading state initially', () => {
    getProfile.mockReturnValue(new Promise(() => {}));
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  test('sets user from successful profile fetch', async () => {
    getProfile.mockResolvedValue({ data: { email: 'fetched@test.com' } });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('fetched@test.com'));
  });

  test('sets user to null when profile fetch fails', async () => {
    getProfile.mockRejectedValue(new Error('Not authenticated'));
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('no user'));
  });

  test('login function sets user', async () => {
    getProfile.mockResolvedValue({ data: { email: 'old@test.com' } });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('old@test.com'));

    act(() => {
      fireEvent.click(screen.getByText('Login'));
    });
    expect(screen.getByTestId('user').textContent).toBe('new@test.com');
  });

  test('logout clears user and calls api logout', async () => {
    getProfile.mockResolvedValue({ data: { email: 'test@test.com' } });
    apiLogout.mockResolvedValue({});

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('test@test.com'));

    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });
    expect(screen.getByTestId('user').textContent).toBe('no user');
    expect(apiLogout).toHaveBeenCalledTimes(1);
  });

  test('refreshUser re-fetches the profile', async () => {
    getProfile
      .mockResolvedValueOnce({ data: { email: 'first@test.com' } })
      .mockResolvedValueOnce({ data: { email: 'refreshed@test.com' } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('first@test.com'));

    await act(async () => {
      fireEvent.click(screen.getByText('Refresh'));
    });
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('refreshed@test.com'));
  });

  test('logout ignores api errors gracefully', async () => {
    getProfile.mockResolvedValue({ data: { email: 'test@test.com' } });
    apiLogout.mockRejectedValue(new Error('Network error'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('test@test.com'));

    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });
    expect(screen.getByTestId('user').textContent).toBe('no user');
  });
});
