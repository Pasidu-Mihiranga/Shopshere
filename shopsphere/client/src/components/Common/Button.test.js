// src/components/Common/Button.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button component', () => {
  test('renders button with correct text', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
  });
  
  test('applies primary variant class by default', () => {
    render(<Button>Button</Button>);
    const button = screen.getByText('Button');
    expect(button).toHaveClass('btn-primary');
  });
  
  test('applies specified variant class', () => {
    render(<Button variant="outline">Button</Button>);
    const button = screen.getByText('Button');
    expect(button).toHaveClass('btn-outline');
  });
  
  test('applies specified size class', () => {
    render(<Button size="large">Button</Button>);
    const button = screen.getByText('Button');
    expect(button).toHaveClass('btn-large');
  });
  
  test('applies full width class when fullWidth is true', () => {
    render(<Button fullWidth>Button</Button>);
    const button = screen.getByText('Button');
    expect(button).toHaveClass('btn-full-width');
  });
  
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Button</Button>);
    const button = screen.getByText('Button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Button</Button>);
    const button = screen.getByText('Button');
    expect(button).toBeDisabled();
  });
});