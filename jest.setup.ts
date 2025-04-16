// Add any Jest setup logic here
import '@testing-library/jest-dom';

// Mock the fetch API
global.fetch = jest.fn();

// Mock environment variables
process.env = {
  ...process.env,
  XI_API_KEY: 'test-api-key',
  AGENT_ID: 'test-agent-id',
}; 