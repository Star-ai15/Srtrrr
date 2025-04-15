
# Opal Purchase Monitor

Monitors Opal sales by detecting SOL deposits to:

- Small Opal: 0.03 SOL (0.02 + 0.01 fee)
- Large Opal: 0.06 SOL (0.05 + 0.01 fee)

Logs buyer address on console. No token sent.

To run:
pip install solana
python opal_listener.py
