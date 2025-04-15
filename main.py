
import os, base64, asyncio
from solana.keypair import Keypair
from solana.publickey import PublicKey
from solana.rpc.async_api import AsyncClient
from spl.token.async_client import AsyncToken

RPC = "https://api.mainnet-beta.solana.com"

CONFIG = {
  "RwtrK6knmiYeTuJgNAo85jN7DUzVpFiJPBeyV4BFeqN": {
    "env": "PUB_SECRET",
    "rate": 300000000 / 700,  # 30% → 700 SOL
    "mint": "7Hajt3Yc7MQhWwNsUAxdUgcLH7M59u1bDpZ79E5Zkmat"
  },
  "8k2pViV4mKbeL5jv5QVwCr44VCtehnTzhDmtrRywjrFL": {
    "env": "VC_SECRET",
    "rate": 200000000 / 350,  # 20% → 350 SOL
    "mint": "7Hajt3Yc7MQhWwNsUAxdUgcLH7M59u1bDpZ79E5Zkmat"
  }
}

async def monitor():
    client = AsyncClient(RPC)
    seen = set()
    while True:
        for addr, cfg in CONFIG.items():
            pubkey = PublicKey(addr)
            sigs = (await client.get_signatures_for_address(pubkey, limit=10)).value
            for sig in sigs:
                if sig.signature in seen or sig.err: continue
                tx = await client.get_transaction(sig.signature)
                sender = tx.transaction.message.account_keys[0]
                post = tx.meta.post_balances[0]
                pre = tx.meta.pre_balances[0]
                sol_amount = (post - pre) / 1e9
                if sol_amount < 0.01: continue
                amount = int(sol_amount * cfg["rate"] * 1_000_000)
                print(f"Airdrop {amount/1_000_000:.2f} STAR to {sender} from {addr}")
                secret = base64.b64decode(os.environ[cfg["env"]])
                kp = Keypair.from_secret_key(secret)
                token = AsyncToken(client, PublicKey(cfg["mint"]), PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), kp)
                await token.transfer(pubkey, sender, kp, amount, 6)
                seen.add(sig.signature)
        await asyncio.sleep(15)

if __name__ == "__main__":
    asyncio.run(monitor())
