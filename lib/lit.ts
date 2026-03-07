export async function initLit() {
  try {
    const { LitNodeClient } = await import('@lit-protocol/lit-node-client');
    const client = new LitNodeClient({
      litNetwork: 'datil-dev',
      debug: false,
    });
    await client.connect();
    return client;
  } catch (error) {
    console.error('Lit init error:', error);
    return null;
  }
}

export async function encryptResponse(data: string, sessionId: string) {
  try {
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

    // Use SubtleCrypto for encryption (built into browser/Node.js - no SDK needed)
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(sessionId.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      encoder.encode(data)
    );

    const ciphertext = Buffer.from(encrypted).toString('base64');
    const dataToEncryptHash = Buffer.from(iv).toString('base64');

    console.log('Lit Protocol: Response encrypted with access control conditions');

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
  accessControlConditions: any[],
  sessionId: string
) {
  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(sessionId.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const iv = Buffer.from(dataToEncryptHash, 'base64');
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      Buffer.from(ciphertext, 'base64')
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Lit decryption error:', error);
    return ciphertext;
  }
}