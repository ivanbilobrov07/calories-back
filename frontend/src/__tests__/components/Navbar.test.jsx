import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require('../../context/AuthContext');
const Navbar = require('../../components/Navbar').default;

const renderNavbar = (user = { email: 'test@test.com', name: null }) => {
  const logout = jest.fn().mockResolvedValue(undefined);
  useAuth.mockReturnValue({ user, logout });
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
  return { logout };
};

describe('Navbar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders the brand name', () => {
    renderNavbar();
    expect(screen.getByText('CalorieTracker')).toBeInTheDocument();
  });

  test('renders all navigation links', () => {
    renderNavbar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Meal Log')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('shows user email when no name is set', () => {
    renderNavbar({ email: 'user@example.com', name: null });
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  test('shows user name when name is available', () => {
    renderNavbar({ email: 'user@example.com', name: 'Alice' });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
  });

  test('renders logout button', () => {
    renderNavbar();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('calls logout when logout button is clicked', async () => {
    const { logout } = renderNavbar();
    fireEvent.click(screen.getByText('Logout'));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
