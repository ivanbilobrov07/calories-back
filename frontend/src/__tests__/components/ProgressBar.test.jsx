import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../../components/ProgressBar';

describe('ProgressBar', () => {
  test('shows consumed kcal rounded to nearest integer', () => {
    render(<ProgressBar consumed={1500.7} goal={2000} />);
    expect(screen.getByText('1501 kcal consumed')).toBeInTheDocument();
  });

  test('shows goal kcal when goal is set', () => {
    render(<ProgressBar consumed={500} goal={2000} />);
    expect(screen.getByText('2000 kcal goal')).toBeInTheDocument();
  });

  test('shows "No goal set" when goal is 0', () => {
    render(<ProgressBar consumed={100} goal={0} />);
    expect(screen.getByText('No goal set')).toBeInTheDocument();
  });

  test('fill width reflects percentage of consumed/goal', () => {
    const { container } = render(<ProgressBar consumed={1000} goal={2000} />);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill.style.width).toBe('50%');
  });

  test('fill width is capped at 100% when over goal', () => {
    const { container } = render(<ProgressBar consumed={3000} goal={2000} />);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill.style.width).toBe('100%');
  });

  test('adds "over" class when consumed exceeds goal', () => {
    const { container } = render(<ProgressBar consumed={2500} goal={2000} />);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill).toHaveClass('over');
  });

  test('does not add "over" class when consumed equals goal', () => {
    const { container } = render(<ProgressBar consumed={2000} goal={2000} />);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill).not.toHaveClass('over');
  });

  test('fill width is 0% when goal is 0', () => {
    const { container } = render(<ProgressBar consumed={500} goal={0} />);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill.style.width).toBe('0%');
  });
});
