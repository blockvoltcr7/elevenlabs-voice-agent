import { validateEnvVars, createErrorResponse, createSuccessResponse } from '@/app/lib/utils';

/**
 * GET handler for /api/elevenlabs
 * Returns a signed WebSocket URL from ElevenLabs
 */
export async function GET(): Promise<Response> {
  // Validate environment variables
  try {
    validateEnvVars();
  } catch (error) {
    console.error('Environment validation error:', error);
    return createErrorResponse('Server configuration error', 500);
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${process.env.AGENT_ID}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': process.env.XI_API_KEY as string,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return createErrorResponse('Failed to get signed URL from ElevenLabs', response.status);
    }

    const body = await response.json();
    return createSuccessResponse({ signed_url: body.signed_url });
  } catch (error) {
    console.error('Error fetching signed URL:', error);
    return createErrorResponse('Failed to communicate with ElevenLabs API', 500);
  }
} 