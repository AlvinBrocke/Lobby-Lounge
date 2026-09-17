export {};

// Shape of the custom claims added to Clerk's session token in the Dashboard
// (Configure → Sessions → Customize session token):
//   { "metadata": "{{user.public_metadata}}" }
// This makes `sessionClaims.metadata.onboardingComplete` typed in proxy.ts and
// anywhere `auth()` is called on the server.
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      onboardingComplete?: boolean;
    };
  }
}
