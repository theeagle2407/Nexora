import * as LitJsSdk from '@lit-protocol/lit-node-client';

let litNodeClient: any;

export async function initLit() {
  if (litNodeClient) return litNodeClient;
  
  litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: 'datil-dev', // Updated network name
  });
  
  await litNodeClient.connect();
  return litNodeClient;
}

export async function encryptResponse(data: string, sessionId: string) {
  try {
    const client = await initLit();
    
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

    const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
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
    
    const decryptedString = await LitJsSdk.decryptToString(
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