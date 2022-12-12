export class NativeAuthClientConfig {
  apiUrl: string = 'https://api.elrond.com';
  expirySeconds: number = 60 * 60 * 24;
  blockHashShard?: number;
}
