# How to Test ElevenLabs Voice Agent API Integration

## What is ElevenLabs API Integration?

The ElevenLabs API integration allows our application to connect to ElevenLabs' Conversational AI service, enabling interactive voice agents through a WebSocket connection. The core functionality is obtaining a signed URL from ElevenLabs which is used to establish this connection.

## Why it matters

Proper testing of the API integration ensures:
- The application can reliably communicate with ElevenLabs services
- Error handling works correctly in case of API failures
- Environment variables are validated correctly
- The WebSocket connection can be established securely

## How to test the integration

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up test environment variables (already configured in Jest setup):
   ```
   XI_API_KEY=test-api-key
   AGENT_ID=test-agent-id
   ```

### Running automated tests

We use Jest, React Testing Library, and MSW (Mock Service Worker) for testing the API integration:

1. Run all tests:
   ```bash
   npm test
   ```

2. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

3. Run tests in watch mode (helpful during development):
   ```bash
   npm run test:watch
   ```

### Manual testing

To test the API integration manually:

1. Set up your `.env.local` file with real ElevenLabs credentials:
   ```
   XI_API_KEY=your_actual_elevenlabs_api_key
   AGENT_ID=your_actual_elevenlabs_agent_id
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Test the API endpoint using your browser or tools like Postman/curl:
   ```bash
   curl http://localhost:3000/api/elevenlabs
   ```

4. The response should be JSON containing a `signed_url` value:
   ```json
   {
     "signed_url": "wss://example.com/websocket?token=..."
   }
   ```

### Testing different scenarios

To verify the API handles different scenarios correctly:

1. **Missing environment variables**: Temporarily remove environment variables to test validation
2. **API errors**: Use an invalid API key to test error handling
3. **Network failures**: Test while offline to verify error handling

## Known limitations

- The signed URL is only valid for a limited time (usually a few minutes)
- Testing with real credentials will make actual API calls to ElevenLabs
- MSW mocks don't test the actual network connection, only the request/response flow 