export async function registerSessionOnChain(sessionCode: string, sessionTitle: string) {
  try {
    const res = await fetch('/api/near', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCode, sessionTitle }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'NEAR request failed');
    }

    const data = await res.json();

    return {
      success: true,
      txHash: data.txHash,
      network: 'testnet',
      explorer: data.explorer,
      message: 'Session coordination registered on NEAR blockchain',
    };
  } catch (error) {
    console.error('NEAR registration error:', error);
    return {
      success: false,
      txHash: null,
      explorer: null,
      message: 'NEAR registration failed (non-critical)',
    };
  }
}