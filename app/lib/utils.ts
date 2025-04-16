/**
 * Utility functions for the ElevenLabs Voice Agent application
 */

/**
 * Validates required environment variables
 * @throws Error if any required variables are missing
 */
export function validateEnvVars(): void {
  const requiredVars = ['XI_API_KEY', 'AGENT_ID'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}

/**
 * API error response helper
 */
export function createErrorResponse(
  message: string,
  status: number = 500
): Response {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Success response helper
 */
export function createSuccessResponse(
  data: Record<string, unknown>,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
} 