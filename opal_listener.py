
import asyncio
from solana.rpc.async_api import AsyncClient
from solana.publickey import PublicKey

RPC = "https://api.mainnet-beta.solana.com"
OPAL_WALLET = PublicKey("FNVruuziVqeYor5xNkx2ENsndjonqiWLEMjnXUs7JuXe")

async def monitor_opal():
    client = AsyncClient(RPC)
    seen = set()
    print("Watching for Opal purchases...")
    while True:
        sigs = (await client.get_signatures_for_address(OPAL_WALLET, limit=10)).value
        for sig in sigs:
            if sig.signature in seen: continue
            tx = await client.get_transaction(sig.signature)
            buyer = tx.transaction.message.account_keys[0]
            pre = tx.meta.pre_balances[0]
            post = tx.meta.post_balances[0]
            sol = (post - pre) / 1e9
            if sol >= 0.03 and sol < 0.05:
                print(f"Small Opal purchased by {buyer} ({sol:.3f} SOL)")
            elif sol >= 0.06:
                print(f"Large Opal purchased by {buyer} ({sol:.3f} SOL)")
            seen.add(sig.signature)
        await asyncio.sleep(15)

if __name__ == "__main__":
    asyncio.run(monitor_opal())
