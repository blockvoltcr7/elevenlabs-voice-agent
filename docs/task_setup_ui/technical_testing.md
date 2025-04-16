# ElevenLabs Voice Agent - Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [API Routes](#api-routes)
4. [Client-Server Communication](#client-server-communication)
5. [WebSocket Communication](#websocket-communication)
6. [Environment Configuration](#environment-configuration)
7. [Testing Strategy](#testing-strategy)
   - [Unit Testing](#unit-testing)
   - [Integration Testing](#integration-testing)
   - [End-to-End Testing](#end-to-end-testing)
8. [Deployment](#deployment)
9. [Performance Considerations](#performance-considerations)

## Project Overview

The ElevenLabs Voice Agent is a Next.js application that enables real-time voice conversations with AI agents. It uses the ElevenLabs Conversational AI API to handle voice input/output and provide intelligent responses. The application is built with TypeScript, shadcn UI components, and Tailwind CSS for styling.

## Architecture

### Frontend (Client-Side)

- **Next.js**: App Router for page organization and routing
- **React**: Component-based UI architecture
- **TypeScript**: Type-safe development
- **shadcn UI**: Component library built on Radix UI and Tailwind CSS
- **Web Audio API**: Audio processing and visualization

### Backend (Server-Side)

- **Next.js API Routes**: Server endpoints to handle authentication and API communications
- **Environment Variables**: Secure storage of API keys and configuration

### Data Flow

1. User initiates conversation via UI
2. Client requests signed URL from server
3. Server authenticates with ElevenLabs API and returns signed URL
4. Client establishes WebSocket connection using signed URL
5. Voice data streams bidirectionally between client and ElevenLabs servers
6. UI updates with transcriptions and visualizations

## API Routes

### `/api/elevenlabs/route.ts`

Handles generating signed URLs for ElevenLabs conversations.

**Endpoint**: `GET /api/elevenlabs`

**Response**:
```json
{
  "signedUrl": "wss://api.elevenlabs.io/v1/convai/conversation/..."
}
```

**Error Response**:
```json
{
  "error": "Error message"
}
```

**Implementation Details**:
- Makes authenticated request to ElevenLabs API
- Uses environment variables for API key and agent ID
- Implements error handling for API failures
- Returns signed WebSocket URL to client

## Client-Server Communication

### Authentication Flow

1. **Client Initialization**:
   ```typescript
   const startConversation = async () => {
     // Get signed URL from our server
     const response = await fetch('/api/elevenlabs');
     const data = await response.json();
     
     // Use the signed URL to establish connection
     const conv = await Conversation.startSession({
       signedUrl: data.signedUrl,
       // Additional configuration...
     });
   };
   ```

2. **Server Authentication**:
   ```typescript
   // Server-side API route
   const response = await fetch(
     `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${process.env.AGENT_ID}`,
     {
       headers: {
         'xi-api-key': process.env.XI_API_KEY,
       },
     }
   );
   ```

## WebSocket Communication

The ElevenLabs client library handles WebSocket communication internally, managing:

1. **Connection Lifecycle**:
   - Connection establishment
   - Reconnection logic
   - Graceful disconnection

2. **Message Types**:
   - Voice input streaming
   - Transcription updates (tentative and final)
   - AI responses (text and audio)
   - Status updates

3. **Callback Handlers**:
   ```typescript
   const conv = await Conversation.startSession({
     signedUrl: data.signedUrl,
     onConnect: () => { /* Handle connection established */ },
     onDisconnect: () => { /* Handle disconnection */ },
     onMessage: (message) => { /* Handle new messages */ },
     onStatusChange: (status) => { /* Handle status changes */ },
     onModeChange: (mode) => { /* Handle mode changes */ },
     onError: (error) => { /* Handle errors */ },
   });
   ```

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file with:

```
XI_API_KEY=your_elevenlabs_api_key
AGENT_ID=your_elevenlabs_agent_id
```

### Next.js Configuration

Update `next.config.js` to add any necessary configuration:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Required for WebSocket connections
        source: '/api/elevenlabs',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
```

## Testing Strategy

### Testing Packages to Install

```bash
# Testing framework and utilities
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event 

# For TypeScript support
npm install --save-dev @types/jest ts-jest

# For API mocking
npm install --save-dev msw

# For end-to-end testing
npm install --save-dev cypress @cypress/code-coverage

# For WebSocket mocking
npm install --save-dev mock-socket
```

### Jest Configuration

Create a `jest.config.js` file:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### Unit Testing

#### Component Testing

Test individual UI components with React Testing Library:

```typescript
// __tests__/components/VoiceAgent.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoiceAgent from '@/components/VoiceAgent';
import { mockNavigatorMediaDevices, mockFetch } from '../__mocks__/browserMocks';

// Mock the ElevenLabs client
jest.mock('@11labs/client', () => ({
  Conversation: {
    startSession: jest.fn().mockResolvedValue({
      endSession: jest.fn(),
      getInputByteFrequencyData: jest.fn().mockResolvedValue(new Uint8Array(32)),
      getOutputByteFrequencyData: jest.fn().mockResolvedValue(new Uint8Array(32)),
      setVolume: jest.fn(),
    }),
  },
}));

describe('VoiceAgent', () => {
  beforeEach(() => {
    // Setup mocks
    mockNavigatorMediaDevices();
    mockFetch();
  });

  it('renders the start button when disconnected', () => {
    render(<VoiceAgent />);
    expect(screen.getByText(/start conversation/i)).toBeInTheDocument();
  });

  it('shows connecting state when start button is clicked', async () => {
    render(<VoiceAgent />);
    userEvent.click(screen.getByText(/start conversation/i));
    
    await waitFor(() => {
      expect(screen.getByText(/connecting/i)).toBeInTheDocument();
    });
  });

  // Additional tests...
});
```

#### Utility Function Testing

```typescript
// __tests__/utils/audioHelpers.test.ts
import { calculateAudioLevel, processFrequencyData } from '@/utils/audioHelpers';

describe('Audio Helper Utils', () => {
  it('calculates audio level correctly', () => {
    const testData = new Uint8Array([0, 50, 100, 150, 200, 250]);
    expect(calculateAudioLevel(testData)).toBeCloseTo(0.49, 2);
  });
  
  // Additional tests...
});
```

### Integration Testing

#### API Route Testing

Use MSW (Mock Service Worker) to test API routes:

```typescript
// __tests__/api/elevenlabs.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import fetch from 'node-fetch';

const server = setupServer(
  rest.get('https://api.elevenlabs.io/v1/convai/conversation/get_signed_url', (req, res, ctx) => {
    return res(
      ctx.json({
        signed_url: 'wss://test.elevenlabs.io/ws/connection',
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('/api/elevenlabs', () => {
  it('returns a signed URL when successful', async () => {
    const response = await fetch('http://localhost:3000/api/elevenlabs');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.signedUrl).toBe('wss://test.elevenlabs.io/ws/connection');
  });
  
  it('handles API errors correctly', async () => {
    server.use(
      rest.get('https://api.elevenlabs.io/v1/convai/conversation/get_signed_url', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'API error' }));
      })
    );
    
    const response = await fetch('http://localhost:3000/api/elevenlabs');
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.error).toBeTruthy();
  });
});
```

#### WebSocket Communication Testing

Use `mock-socket` to test WebSocket interactions:

```typescript
// __tests__/websocket/conversation.test.ts
import { Server, WebSocket } from 'mock-socket';
import { Conversation } from '@11labs/client';

describe('Conversation WebSocket', () => {
  let mockServer;
  let url = 'ws://localhost:8080';

  beforeEach(() => {
    mockServer = new Server(url);
    // Mock the global WebSocket
    global.WebSocket = WebSocket;
  });

  afterEach(() => {
    mockServer.stop();
  });

  it('establishes connection and handles messages', async () => {
    const onMessageMock = jest.fn();
    
    // Setup message handler
    mockServer.on('connection', socket => {
      socket.send(JSON.stringify({
        text: 'Hello from agent',
        isUser: false,
        final: true
      }));
    });
    
    // Test the client
    const conversation = await Conversation.startSession({
      signedUrl: url,
      onMessage: onMessageMock
    });
    
    // Wait for the message to be processed
    await new Promise(r => setTimeout(r, 100));
    
    expect(onMessageMock).toHaveBeenCalledWith({
      text: 'Hello from agent',
      isUser: false,
      final: true
    });
    
    // Cleanup
    await conversation.endSession();
  });
});
```

### End-to-End Testing

Use Cypress for end-to-end tests:

```typescript
// cypress/e2e/voice-agent.cy.ts
describe('Voice Agent', () => {
  beforeEach(() => {
    // Mock navigator.mediaDevices
    cy.window().then((win) => {
      win.navigator.mediaDevices = {
        getUserMedia: () => Promise.resolve({
          getTracks: () => [{
            stop: () => {}
          }]
        })
      };
    });
    
    // Intercept API requests
    cy.intercept('GET', '/api/elevenlabs', {
      statusCode: 200,
      body: {
        signedUrl: 'wss://example.com/ws'
      }
    }).as('getSignedUrl');
    
    // Visit the page
    cy.visit('/');
  });
  
  it('shows the voice agent interface', () => {
    cy.get('h1').contains('ElevenLabs Voice Agent');
    cy.get('button').contains('Start Conversation').should('be.visible');
  });
  
  it('starts a conversation when button is clicked', () => {
    // Click the start button
    cy.get('button').contains('Start Conversation').click();
    
    // Wait for API call
    cy.wait('@getSignedUrl');
    
    // Check for connecting state
    cy.get('[data-testid="status-badge"]').should('contain', 'connecting');
    
    // Mock successful connection (would need WebSocket mocking)
    // This is simplified - WebSocket testing in Cypress requires additional setup
  });
});
```

### Smoke Tests for QA

Create a set of basic smoke tests that QA can run:

```typescript
// cypress/e2e/smoke-tests.cy.ts
describe('Voice Agent Smoke Tests', () => {
  beforeEach(() => {
    // Setup mocks and visit page
    cy.setupMocks();
    cy.visit('/');
  });
  
  it('UI loads correctly', () => {
    cy.get('h1').should('be.visible');
    cy.get('button').contains('Start Conversation').should('be.visible');
    cy.get('[data-testid="status-badge"]').should('contain', 'disconnected');
  });
  
  it('Can start a conversation', () => {
    cy.get('button').contains('Start Conversation').click();
    cy.get('[data-testid="status-badge"]').should('contain', 'connecting');
    
    // Mock WebSocket connection success
    cy.mockWebSocketConnected();
    
    cy.get('[data-testid="status-badge"]').should('contain', 'connected');
  });
  
  it('Shows error message when API fails', () => {
    // Override the intercept to return an error
    cy.intercept('GET', '/api/elevenlabs', {
      statusCode: 500,
      body: { error: 'API Error' }
    }).as('getSignedUrlError');
    
    cy.get('button').contains('Start Conversation').click();
    cy.wait('@getSignedUrlError');
    
    cy.get('[data-testid="error-alert"]').should('be.visible');
  });
  
  // Additional smoke tests...
});
```

## Deployment

### Vercel Deployment (Recommended)

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Set environment variables in the Vercel dashboard:
   - `XI_API_KEY`
   - `AGENT_ID`
4. Deploy the application

### Environment-Specific Configurations

```typescript
// lib/config.ts
export const config = {
  elevenlabsApiUrl: process.env.NEXT_PUBLIC_ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1',
  enableDebugLogs: process.env.NODE_ENV === 'development',
  reconnectInterval: process.env.NODE_ENV === 'development' ? 1000 : 5000,
};
```

## Performance Considerations

### Audio Processing

- Use Web Workers for intensive audio processing to avoid UI thread blocking
- Implement throttling for visualization updates
- Consider downsampling audio data for performance

### WebSocket Management

- Implement reconnection strategies with exponential backoff
- Handle connection state transitions carefully
- Close unused connections to avoid resource leaks

### Bundle Size Optimization

- Use dynamic imports for non-critical components
- Consider tree-shaking and code splitting
- Monitor bundle size with tools like `@next/bundle-analyzer`