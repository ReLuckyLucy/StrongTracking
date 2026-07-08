import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all page components to isolate App routing tests
jest.mock('./pages/LoginPage', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('./pages/HomePage', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('./pages/NewTrainingPage', () => () => <div data-testid="new-training-page">New Training Page</div>);
jest.mock('./pages/HistoryPage', () => () => <div data-testid="history-page">History Page</div>);
jest.mock('./pages/StatsPage', () => () => <div data-testid="stats-page">Stats Page</div>);

// Mock the SCSS import
jest.mock('./styles/neu-morphism.scss', () => ({}));

describe('App routing', () => {
  test('renders login page at /login', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('renders home page at /', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('renders new training page at /training/new', () => {
    window.history.pushState({}, '', '/training/new');
    render(<App />);
    expect(screen.getByTestId('new-training-page')).toBeInTheDocument();
  });

  test('renders history page at /history', () => {
    window.history.pushState({}, '', '/history');
    render(<App />);
    expect(screen.getByTestId('history-page')).toBeInTheDocument();
  });

  test('renders stats page at /stats', () => {
    window.history.pushState({}, '', '/stats');
    render(<App />);
    expect(screen.getByTestId('stats-page')).toBeInTheDocument();
  });

  test('redirects unknown routes to home page', () => {
    window.history.pushState({}, '', '/nonexistent');
    render(<App />);
    // Unknown routes redirect to "/" which renders HomePage
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
