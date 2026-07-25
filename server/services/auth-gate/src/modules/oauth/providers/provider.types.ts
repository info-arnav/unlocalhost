export interface VerifiedIdentity {
  provider: 'github' | 'google';
  email: string;
  name: string;
  providerAccountId: string;
}

export interface OAuthProvider {
  readonly id: 'github' | 'google';
  authorizeUrl(state: string): string;
  verify(code: string): Promise<VerifiedIdentity>;
}
