# Lumina Protocol

Lumina Protocol makes a simple promise: when a contribution keeps creating value, it keeps getting rewarded. 

Built on GenLayer's intelligent contracts, it evaluates the ongoing real-world impact of open-source contributions using LLM-driven consensus, dispensing continuous rewards from a dedicated sponsor pool as long as the work remains valuable.

## Overview

Traditional bounties are one-and-done, paying out only for initial delivery regardless of long-term adoption or maintenance. Lumina Protocol flips this model using "Living Bounties". 

A sponsor creates a Living Bounty with an initial reward for completion, plus a "Lumina Pool" for future rewards. When a contributor completes the work, they get the initial payout. Every cycle (e.g., 90 days), validators on the GenLayer network independently crawl the web for evidence of the project's impact—new dependencies, production deployments, documentation mentions, etc. 

Using GenLayer's Equivalence Principle, validators reach consensus on the real-world value created since the last review and dispense a proportionate impact reward from the Lumina Pool.

## Technical Architecture

The protocol leverages GenLayer's unique features:
- **Intelligent Contracts (`LuminaProtocol.py`)**: Written in Python, running on the GenVM.
- **Native Web Access**: Contract closures dynamically fetch web evidence (GitHub repos, docs, articles).
- **LLM Consensus (`gl.eq_principle.prompt_comparative`)**: Validators use LLMs to evaluate impact and agree on a precise reward.
- **Vite + React Frontend**: A modern, Doodles-inspired UI for sponsors to create bounties and contributors to track their portfolio.

## Local Setup

### Smart Contract

The contract is located in `contracts/lumina_protocol.py`.

Requirements:
- GenLayer SDK (`genvm-lint`, etc.)

Validate the contract:
```bash
genvm-lint check contracts/lumina_protocol.py
```

### Frontend

The frontend is built with Vite, React, and TypeScript.

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file based on `.env.example` to link your deployed contract address.

## Deployment

To deploy this on Vercel:
1. Push this repository to GitHub.
2. Link the repository in the Vercel dashboard.
3. Configure environment variables.
4. Deploy!
