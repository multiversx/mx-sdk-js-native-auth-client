import axios from "axios";
import MockAdapter, { RequestHandler } from "axios-mock-adapter";
import { NativeAuthClient } from '../src';

describe("Native Auth", () => {
  let mock: MockAdapter;
  const ADDRESS = 'erd1qnk2vmuqywfqtdnkmauvpm8ls0xh00k8xeupuaf6cm6cd4rx89qqz0ppgl';
  const SIGNATURE = '906e79d54e69e688680abee54ec0c49ce2561eb5abfd01865b31cb3ed738272c7cfc4fc8cc1c3590dd5757e622639b01a510945d7f7c9d1ceda20a50a817080d';
  const BLOCK_HASH = 'ab459013b27fdc6fe98eed567bd0c1754e0628a4cc16883bf0170a29da37ad46';
  const TTL = 86400;
  const ORIGIN = 'https://api.multiversx.com';
  const TOKEN = `aHR0cHM6Ly9hcGkubXVsdGl2ZXJzeC5jb20.${BLOCK_HASH}.${TTL}.e30`;
  const ACCESS_TOKEN = 'ZXJkMXFuazJ2bXVxeXdmcXRkbmttYXV2cG04bHMweGgwMGs4eGV1cHVhZjZjbTZjZDRyeDg5cXF6MHBwZ2w.YUhSMGNITTZMeTloY0drdWJYVnNkR2wyWlhKemVDNWpiMjAuYWI0NTkwMTNiMjdmZGM2ZmU5OGVlZDU2N2JkMGMxNzU0ZTA2MjhhNGNjMTY4ODNiZjAxNzBhMjlkYTM3YWQ0Ni44NjQwMC5lMzA.906e79d54e69e688680abee54ec0c49ce2561eb5abfd01865b31cb3ed738272c7cfc4fc8cc1c3590dd5757e622639b01a510945d7f7c9d1ceda20a50a817080d';

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
        origin: ORIGIN,
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
  const SIGNATURE = '906e79d54e69e688680abee54ec0c49ce2561eb5abfd01865b31cb3ed738272c7cfc4fc8cc1c3590dd5757e622639b01a510945d7f7c9d1ceda20a50a817080d';
  const BLOCK_HASH = 'ab459013b27fdc6fe98eed567bd0c1754e0628a4cc16883bf0170a29da37ad46';
  const TTL = 86400;
  const ORIGIN = 'https://api.multiversx.com';
  const TOKEN = `aHR0cHM6Ly9hcGkubXVsdGl2ZXJzeC5jb20.${BLOCK_HASH}.${TTL}.e30`;
  const ACCESS_TOKEN = 'ZXJkMXFuazJ2bXVxeXdmcXRkbmttYXV2cG04bHMweGgwMGs4eGV1cHVhZjZjbTZjZDRyeDg5cXF6MHBwZ2w.YUhSMGNITTZMeTloY0drdWJYVnNkR2wyWlhKemVDNWpiMjAuYWI0NTkwMTNiMjdmZGM2ZmU5OGVlZDU2N2JkMGMxNzU0ZTA2MjhhNGNjMTY4ODNiZjAxNzBhMjlkYTM3YWQ0Ni44NjQwMC5lMzA.906e79d54e69e688680abee54ec0c49ce2561eb5abfd01865b31cb3ed738272c7cfc4fc8cc1c3590dd5757e622639b01a510945d7f7c9d1ceda20a50a817080d';
  const LATEST_ROUND = 115656;
  const METASHARD = 4294967295;
  const GATEWAY = 'https://gateway.multiversx.com';

  const onBlocksByRound = function (mock: MockAdapter): RequestHandler {
    return mock.onGet(`${GATEWAY}/blocks/by-round/${LATEST_ROUND}`);
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
        origin: ORIGIN,
        gatewayUrl: GATEWAY,
        blockHashShard: METASHARD,
      });

      onNetworkStatus(mock).reply(200, { data: { status: { erd_current_round: LATEST_ROUND } } });
      onBlocksByRound(mock).reply(200, { data: { blocks: [{ shard: METASHARD, hash: BLOCK_HASH }] } });

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

      onNetworkStatus(mock).reply(200, [{ data: { status: { erd_current_round: LATEST_ROUND } } }]);
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
