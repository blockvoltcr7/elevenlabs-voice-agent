import { GET } from '../route';

// Mock Response class for tests
class MockResponse {
  body: string;
  init: ResponseInit;

  constructor(body: string | object, init: ResponseInit = {}) {
    this.body = typeof body === 'string' ? body : JSON.stringify(body);
    this.init = init;
  }

  get status() {
    return this.init.status || 200;
  }

  async json() {
    return JSON.parse(this.body);
  }
}

// Mock the utils module
jest.mock('@/app/lib/utils', () => ({
  validateEnvVars: jest.fn(),
  createErrorResponse: jest.fn().mockImplementation((message, status) => 
    new MockResponse({ error: message }, { status })
  ),
  createSuccessResponse: jest.fn().mockImplementation((data) => 
    new MockResponse(data, { status: 200 })
  ),
}));

describe('ElevenLabs API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should return a signed URL when API call is successful', async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ signed_url: 'wss://example.com/websocket' }),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ signed_url: 'wss://example.com/websocket' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.elevenlabs.io/v1/convai/conversation/get_signed_url'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'xi-api-key': 'test-api-key',
        }),
      })
    );
  });

  it('should handle ElevenLabs API errors', async () => {
    // Mock failed fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    const response = await GET();
    
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to get signed URL from ElevenLabs' });
  });

  it('should handle network errors', async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const response = await GET();
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to communicate with ElevenLabs API' });
  });
}); 