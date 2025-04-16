import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock the ElevenLabs API
  http.get('https://api.elevenlabs.io/v1/convai/conversation/get_signed_url', ({ request }) => {
    // Check if the correct agent ID is used in the query parameter
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agent_id');
    
    if (!agentId) {
      return HttpResponse.json(
        { error: 'Missing agent_id parameter' },
        { status: 400 }
      );
    }
    
    // Check for valid API key
    const apiKey = request.headers.get('xi-api-key');
    if (!apiKey) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Return a successful response with a mock signed URL
    return HttpResponse.json({
      signed_url: 'wss://example.com/websocket?token=mock-token',
    });
  }),
]; 