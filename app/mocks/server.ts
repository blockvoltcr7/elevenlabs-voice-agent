import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Set up the mocked server
export const server = setupServer(...handlers); 