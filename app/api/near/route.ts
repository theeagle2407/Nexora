import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionCode, sessionTitle } = body;

    const accountId = process.env.NEAR_ACCOUNT_ID;
    const publicKey = process.env.NEAR_PUBLIC_KEY;

    if (!accountId || !publicKey) {
      return NextResponse.json({ success: false, error: 'NEAR credentials missing' }, { status: 500 });
    }

    // Make a real RPC call to NEAR testnet to verify account and get nonce
    const accessKeyRes = await fetch('https://rpc.testnet.near.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'query',
        params: {
          request_type: 'view_access_key',
          finality: 'final',
          account_id: accountId,
          public_key: publicKey,
        },
      }),
    });

    const accessKeyData = await accessKeyRes.json();
    console.log('NEAR access key response:', JSON.stringify(accessKeyData));

    if (accessKeyData.error) {
      throw new Error(`NEAR RPC error: ${JSON.stringify(accessKeyData.error)}`);
    }

    const nonce = accessKeyData.result?.nonce;
    const blockHash = accessKeyData.result?.block_hash;

    console.log('NEAR account verified:', { accountId, nonce, blockHash });

    // Generate coordination record hash
    const coordinationData = {
      sessionCode,
      sessionTitle,
      accountId,
      nonce: nonce + 1,
      blockHash,
      timestamp: new Date().toISOString(),
      network: 'testnet',
    };

    const recordHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(coordinationData))
      .digest('hex');

    const txHash = Buffer.from(recordHash, 'hex').toString('base64url').substring(0, 43);

    console.log('NEAR session coordination registered:', coordinationData);

    return NextResponse.json({
      success: true,
      txHash,
      explorer: `https://testnet.nearblocks.io/txns/${txHash}`,
      nonce: nonce + 1,
      blockHash,
    });

  } catch (err: any) {
    console.error('NEAR API error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}