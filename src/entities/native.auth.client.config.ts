export class NativeAuthClientConfig {
  origin: string = typeof window !== "undefined" ? window?.location?.hostname : '';
  apiUrl: string = 'https://api.multiversx.com';
  expirySeconds: number = 60 * 60 * 24;
  blockHashShard?: number;
  gatewayUrl?: string;
  extraRequestHeaders?: { [key: string]: string };
}
