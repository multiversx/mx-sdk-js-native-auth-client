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
    const blockHash = await this.getCurrentBlockHash();
    const encodedExtraInfo = this.encodeValue(JSON.stringify(extraInfo));
    const origin = this.encodeValue(this.config.origin);

    return `${origin}.${blockHash}.${this.config.expirySeconds}.${encodedExtraInfo}`;
  }

  private async getCurrentBlockHash(): Promise<string> {
    if (this.config.gatewayUrl) {
      return await this.getCurrentBlockHashWithGateway();
    }
    return await this.getCurrentBlockHashWithApi();
  }

  private async getCurrentBlockHashWithGateway(): Promise<string> {
    const round = await this.getCurrentRound();
    const url = `${this.config.gatewayUrl}/blocks/by-round/${round}`;
    const response = await axios.get(url);
    const blocks = response.data.data.blocks;
    const block = blocks.filter((block: { shard: number }) => block.shard === this.config.blockHashShard)[0];
    return block.hash;
  }

  private async getCurrentRound(): Promise<number> {
    if (!this.config.gatewayUrl) {
      throw new Error("Gateway URL not set");
    }
    if (!this.config.blockHashShard) {
      throw new Error("Blockhash shard not set");
    }

    const url = `${this.config.gatewayUrl}/network/status/${this.config.blockHashShard}`;
    const response = await axios.get(url);
    const status = response.data.data.status;
    return status.erd_current_round;
  }

  private async getCurrentBlockHashWithApi(): Promise<string> {
    let url = `${this.config.apiUrl}/blocks?size=1&fields=hash`;
    if (this.config.blockHashShard !== undefined) {
      url += `&shard=${this.config.blockHashShard}`;
    }

    const response = await axios.get(url);
    return response.data[0].hash;
  }

  private encodeValue(str: string) {
    return this.escape(Buffer.from(str, "utf8").toString("base64"));
  }

  private escape(str: string) {
    return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
}
