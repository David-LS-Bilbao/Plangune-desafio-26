import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import App from '../App.jsx';

describe('App', () => {
  it('renderiza el título técnico DESAFIO-26', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'DESAFIO-26' }),
    ).toBeInTheDocument();
  });

  it('muestra el texto provisional del proyecto', () => {
    render(<App />);

    expect(
      screen.getByText('App provisional para planes familiares en Euskadi'),
    ).toBeInTheDocument();
  });
});
