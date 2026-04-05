import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('../../api/logs', () => ({
  updateLog: jest.fn(),
  deleteLog: jest.fn(),
}));

const { updateLog, deleteLog } = require('../../api/logs');
const MealCard = require('../../components/MealCard').default;

const mockLog = {
  id: 'log-1',
  mealType: 'breakfast',
  totalKcal: 104,
  totalProtein: 0.6,
  totalFat: 0.4,
  totalCarbs: 27.6,
  items: [
    {
      food: { id: 'food-1', name: 'Apple', kcalPer100g: 52 },
      quantityG: 200,
    },
  ],
};

describe('MealCard', () => {
  let onUpdate, onDelete;

  beforeEach(() => {
    onUpdate = jest.fn();
    onDelete = jest.fn();
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  test('renders food item name', () => {
    render(<MealCard log={mockLog} onUpdate={onUpdate} onDelete={onDelete} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  test('renders total kcal', () => {
    render(<MealCard log={mockLog} onUpdate={onUpdate} onDelete={onDelete} />);
    expect(screen.getByText(/Total 104 kcal/)).toBeInTheDocument();
  });

  test('shows edit form when edit button is clicked', () => {
    render(<MealCard log={mockLog} onUpdate={onUpdate} onDelete={onDelete} />);
    const editBtn = screen.getByTitle('Edit');
    fireEvent.click(editBtn);
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('returns to view mode when cancel is clicked', () => {
    render(<MealCard log={mockLog} onUpdate={onUpdate} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Edit'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  test('calls updateLog and onUpdate when save is clicked', async () => {
    const updated = { ...mockLog, mealType: 'lunch' };
    updateLog.mockResolvedValue({ data: updated });

    render(<MealCard log={mockLog} onUpdate={onUpdate} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Edit'));
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(updateLog).toHaveBeenCalledWith('log-1', expect.any(Object)));
    expect(onUpdate).toHaveBeenCalledWith(updated);
  });

  test('shows confirm dialog and calls deleteLog when delete clicked', async () => {
    deleteLog.mockResolvedValue({});
    render(<MealCard log={mockLog} onUpdate={onUpdate} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Delete'));
    expect(window.confirm).toHaveBeenCalledWith('Delete this entry?');
    await waitFor(() => expect(deleteLog).toHaveBeenCalledWith('log-1'));
    expect(onDelete).toHaveBeenCalledWith('log-1');
  });

  test('does not delete when confirm is cancelled', async () => {
    window.confirm = jest.fn(() => false);
    render(<MealCard log={mockLog} onUpdate={onUpdate} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Delete'));
    expect(deleteLog).not.toHaveBeenCalled();
  });
});
