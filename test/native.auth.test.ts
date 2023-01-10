import axios from "axios";
import MockAdapter, { RequestHandler } from "axios-mock-adapter";
import { NativeAuthClient } from '../src';

describe("Native Auth", () => {
  let mock: MockAdapter;
  const ADDRESS = 'erd1qnk2vmuqywfqtdnkmauvpm8ls0xh00k8xeupuaf6cm6cd4rx89qqz0ppgl';
  const SIGNATURE = '563cb2dfdf96ab335423a05287fa3cd00154034423d0062421ee6ce03230d941da6df9ce79689fcd173c0ba5d4331b3ccd82c8ec2e6ab4d875db1587c2ab720c';
  const BLOCK_HASH = '82ec8044966efb2d00e8a6367ea23ddbc7bea6504ed98f4a1a536d7c21bb2682';
  const TTL = 86400;
  const HOST = 'api.multiversx.com';
  const TOKEN = `YXBpLm11bHRpdmVyc3guY29t.${BLOCK_HASH}.${TTL}.e30`;
  const ACCESS_TOKEN = 'ZXJkMXFuazJ2bXVxeXdmcXRkbmttYXV2cG04bHMweGgwMGs4eGV1cHVhZjZjbTZjZDRyeDg5cXF6MHBwZ2w.WVhCcExtMTFiSFJwZG1WeWMzZ3VZMjl0LjgyZWM4MDQ0OTY2ZWZiMmQwMGU4YTYzNjdlYTIzZGRiYzdiZWE2NTA0ZWQ5OGY0YTFhNTM2ZDdjMjFiYjI2ODIuODY0MDAuZTMw.563cb2dfdf96ab335423a05287fa3cd00154034423d0062421ee6ce03230d941da6df9ce79689fcd173c0ba5d4331b3ccd82c8ec2e6ab4d875db1587c2ab720c';

  const onLatestBlockHashGet = function (mock: MockAdapter): RequestHandler {
    return mock.onGet('https://api.multiversx.com/blocks?size=1&fields=hash');
  };

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  describe("Client", () => {
    it("Latest block should return signable token", async () => {
      const client = new NativeAuthClient({
        host: HOST,
      });

      onLatestBlockHashGet(mock).reply(200, [{ hash: BLOCK_HASH }]);

      const token = await client.initialize();

      expect(token).toStrictEqual(TOKEN);
    });

    it("Internal server error", async () => {
      const client = new NativeAuthClient();

      onLatestBlockHashGet(mock).reply(500);

      await expect(client.initialize()).rejects.toThrow();
    });

    it('Generate Access token', () => {
      const client = new NativeAuthClient();

      const accessToken = client.getToken(
        ADDRESS,
        TOKEN,
        SIGNATURE
      );

      expect(accessToken).toStrictEqual(ACCESS_TOKEN);
    });
  });
});

describe("Native Auth with gateway", () => {
  let mock: MockAdapter;
  const ADDRESS = 'erd1qnk2vmuqywfqtdnkmauvpm8ls0xh00k8xeupuaf6cm6cd4rx89qqz0ppgl';
  const SIGNATURE = '563cb2dfdf96ab335423a05287fa3cd00154034423d0062421ee6ce03230d941da6df9ce79689fcd173c0ba5d4331b3ccd82c8ec2e6ab4d875db1587c2ab720c';
  const BLOCK_HASH = '82ec8044966efb2d00e8a6367ea23ddbc7bea6504ed98f4a1a536d7c21bb2682';
  const TTL = 86400;
  const HOST = 'api.multiversx.com';
  const TOKEN = `YXBpLm11bHRpdmVyc3guY29t.${BLOCK_HASH}.${TTL}.e30`;
  const ACCESS_TOKEN = 'ZXJkMXFuazJ2bXVxeXdmcXRkbmttYXV2cG04bHMweGgwMGs4eGV1cHVhZjZjbTZjZDRyeDg5cXF6MHBwZ2w.WVhCcExtMTFiSFJwZG1WeWMzZ3VZMjl0LjgyZWM4MDQ0OTY2ZWZiMmQwMGU4YTYzNjdlYTIzZGRiYzdiZWE2NTA0ZWQ5OGY0YTFhNTM2ZDdjMjFiYjI2ODIuODY0MDAuZTMw.563cb2dfdf96ab335423a05287fa3cd00154034423d0062421ee6ce03230d941da6df9ce79689fcd173c0ba5d4331b3ccd82c8ec2e6ab4d875db1587c2ab720c';
  const latestRound = 115656;
  const METASHARD = 4294967295;
  const GATEWAY = 'https://gateway.multiversx.com';

  const onBlocksByRound = function (mock: MockAdapter): RequestHandler {
    return mock.onGet(`${GATEWAY}/blocks/by-round/${latestRound}`);
  };

  //https://testnet-gateway.multiversx.com/network/status/4294967295
  const onNetworkStatus = function (mock: MockAdapter): RequestHandler {
    return mock.onGet(`${GATEWAY}/network/status/${METASHARD}`);
  };

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  describe("Client", () => {
    it("Latest block should return signable token", async () => {
      const client = new NativeAuthClient({
        host: HOST,
        gatewayUrl: GATEWAY,
        blockHashShard: METASHARD,
      });

      onNetworkStatus(mock).reply(200, { data: { status: {erd_current_round: latestRound}} });
      onBlocksByRound(mock).reply(200, { data: { blocks: [ {shard: METASHARD, hash: BLOCK_HASH}] }});

      const token = await client.initialize();

      expect(token).toStrictEqual(TOKEN);
    });

    it("Internal server error", async () => {
      const client = new NativeAuthClient({
        gatewayUrl: GATEWAY,
        blockHashShard: METASHARD,
      });

      onNetworkStatus(mock).reply(500);

      await expect(client.initialize()).rejects.toThrow();
    });

    it("Internal server error", async () => {
      const client = new NativeAuthClient({
        gatewayUrl: GATEWAY,
        blockHashShard: METASHARD,
      });

      onNetworkStatus(mock).reply(200, [{ data: { status: {erd_current_round: latestRound}} }]);
      onBlocksByRound(mock).reply(500);

      await expect(client.initialize()).rejects.toThrow();
    });

    it('Generate Access token', () => {
      const client = new NativeAuthClient({
        gatewayUrl: GATEWAY,
        blockHashShard: METASHARD,
      });

      const accessToken = client.getToken(
          ADDRESS,
          TOKEN,
          SIGNATURE
      );

      expect(accessToken).toStrictEqual(ACCESS_TOKEN);
    });
  });
});
