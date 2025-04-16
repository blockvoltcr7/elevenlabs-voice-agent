# ElevenLabs Voice Agent Application

A Next.js application that integrates with ElevenLabs' Conversational AI to create interactive voice agents.

## Features

- Secure API integration with ElevenLabs
- WebSocket-based communication with voice agents
- TypeScript-powered development
- Testing with Jest, React Testing Library, and MSW

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
XI_API_KEY=your_elevenlabs_api_key
AGENT_ID=your_elevenlabs_agent_id
```

You can obtain these values from your ElevenLabs dashboard.

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## API Routes

### GET /api/elevenlabs

Returns a signed WebSocket URL that can be used to establish a connection with an ElevenLabs voice agent.

Example usage:

```javascript
const response = await fetch('/api/elevenlabs');
const data = await response.json();
const signedUrl = data.signed_url;

// Use the signed URL with the ElevenLabs client
const conversation = await Conversation.startSession({ signedUrl });
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Folder Structure

- `app/` - Next.js app directory
  - `api/` - API routes
  - `lib/` - Utility functions
  - `mocks/` - MSW mocks for testing

## License

This project is licensed under the MIT License.
