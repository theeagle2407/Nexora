let litNodeClient: any;

export async function initLit() {
  if (litNodeClient) return litNodeClient;

  try {
    const LitJsSdk = await import('@lit-protocol/lit-node-client');
    const client = new LitJsSdk.LitNodeClient({
      litNetwork: 'datil-dev',
      debug: false,
    });
    await client.connect();
    litNodeClient = client;
    return litNodeClient;
  } catch (error) {
    console.error('Lit init error:', error);
    return null;
  }
}

export async function encryptResponse(data: string, sessionId: string) {
  try {
    const client = await initLit();
    if (!client) throw new Error('Lit client not initialized');

    const { encryptString } = await import('@lit-protocol/lit-node-client');

    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: sessionId,
        },
      },
    ];

    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        accessControlConditions,
        dataToEncrypt: data,
      },
      client
    );

    return {
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
      fallback: false,
    };
  } catch (error) {
    console.error('Lit encryption error:', error);
    return {
      ciphertext: data,
      dataToEncryptHash: '',
      accessControlConditions: [],
      fallback: true,
    };
  }
}

export async function decryptResponse(
  ciphertext: string,
  dataToEncryptHash: string,
  accessControlConditions: any[]
) {
  try {
    const client = await initLit();
    if (!client) throw new Error('Lit client not initialized');

    const { decryptToString } = await import('@lit-protocol/lit-node-client');

    const decryptedString = await decryptToString(
      {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        chain: 'ethereum',
      },
      client
    );

    return decryptedString;
  } catch (error) {
    console.error('Lit decryption error:', error);
    return ciphertext;
  }
}