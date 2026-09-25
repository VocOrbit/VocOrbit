export type VerifiedFirebaseToken = {
  subject: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  signInProvider: string;
  claims: Record<string, unknown>;
};

export interface FirebaseIdTokenVerifier {
  verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseToken>;
}
