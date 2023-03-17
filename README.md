# Native Authenticator for JavaScript

Native Authenticator for JavaScript and TypeScript (written in TypeScript).

## Distribution

[npm](https://www.npmjs.com/package/@multiversx/sdk-native-auth-client)

## Example

### Client-side

```js
const client = new NativeAuthClient();
const init = await client.initialize();

// obtain signature by signing the following message: `${address}${init}`
// Example:
// - if the address is `erd1qnk2vmuqywfqtdnkmauvpm8ls0xh00k8xeupuaf6cm6cd4rx89qqz0ppgl`
// - and the init string is `YXBpLmVscm9uZC5jb20.066de4ba7df143f2383c3e0cd7ef8eeaf13375d1123ec8bafcef9f7908344b0f.86400.e30`
// - then the signable message should be `erd1qnk2vmuqywfqtdnkmauvpm8ls0xh00k8xeupuaf6cm6cd4rx89qqz0ppgl066de4ba7df143f2383c3e0cd7ef8eeaf13375d1123ec8bafcef9f7908344b0f.86400.e30`

const accessToken = client.getToken(address, init, signature);
```

### Client-side config

When initializing the client object, an optional config can also be specified with the following properties:

```js
{
  // When used from within a browser, will contain the hostname by default.
  // It can be overridden for special situations
  // Note: The server-side component will validate the `origin` header, which must
  // match with the provided origin in the client-side configuration
  origin: string = 'https://myApp.com';

  // The endpoint from where the current block information will be fetched upon initialization.
  // The default value points to the mainnet API, but can be overridden to be network-specific
  // or to point to a self-hosted location
  apiUrl: string = 'https://api.multiversx.com';

  // TTL that will be encoded in the access token.
  // This value will also be validated by the server and must not be greater than the maximum ttl allowed.
  // Default: one day (86400 seconds)
  expirySeconds: number = 60 * 60 * 24;

  // Optional, to fetch the block hash from a single shard.
  // Useful in the situations where the server connects directly to a node to fetch block info
  // and would like a predictable shard for the validation of tokens
  blockHashShard: 0;

  // Optional, to put custom HTTP headers in the request that is made to the api
  // Useful in situations where a private api is used and is protected by a JTW token
  extraRequestHeaders?: { [key: string]: string };
}
```
