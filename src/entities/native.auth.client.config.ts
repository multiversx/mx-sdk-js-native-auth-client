export class NativeAuthClientConfig {
  origin: string = typeof window !== "undefined" && typeof window.location !== 'undefined' ? window.location.origin : '';
  apiUrl: string = 'https://api.multiversx.com';
  expirySeconds: number = 60 * 60 * 24;
  blockHashShard?: number;
  gatewayUrl?: string;
  extraRequestHeaders?: { [key: string]: string };
}
