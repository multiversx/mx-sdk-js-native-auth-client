import axios from "axios";
import { NativeAuthClientConfig } from "./entities/native.auth.client.config";

export class NativeAuthClient {
  private readonly config: NativeAuthClientConfig;

  constructor(config?: Partial<NativeAuthClientConfig>) {
    this.config = Object.assign(new NativeAuthClientConfig(), config);
  }

  getToken(address: string, token: string, signature: string): string {
    const encodedAddress = this.encodeValue(address);
    const encodedToken = this.encodeValue(token);

    const accessToken = `${encodedAddress}.${encodedToken}.${signature}`;
    return accessToken;
  }

  async initialize(extraInfo: any = {}): Promise<string> {
    const blockHash = await this.getCurrentBlockHash(this.config.blockHashShard);
    const encodedExtraInfo = this.encodeValue(JSON.stringify(extraInfo));

    return `${blockHash}.${this.config.expirySeconds}.${encodedExtraInfo}`;
  }

  private async getCurrentBlockHash(shard?: number): Promise<string> {
    let url = `${this.config.apiUrl}/blocks?size=1&fields=hash`;
    if (shard !== undefined) {
      url += `&shard=${shard}`;
    }

    const response = await axios.get(url);
    return response.data[0].hash;
  }

  private encodeValue(str: string) {
    return Buffer.from(str, "utf8").toString("base64");
  }
}
