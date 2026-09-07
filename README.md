# RentProof

<p align="center">
  <img src="https://img.shields.io/badge/Midnight-Preprod-7B61FF" alt="Midnight Preprod">
  <img src="https://img.shields.io/badge/Compact-Smart%20Contract-111111" alt="Compact">
  <img src="https://img.shields.io/badge/Network-Preprod-2563EB" alt="Preprod Network">
  <img src="https://img.shields.io/badge/License-Apache%202.0-green.svg" alt="Apache 2.0 License">
</p>

<p align="center">
  <strong>Prove you can afford the rent -- without showing your bank balance.</strong>
</p>

<p align="center">
  A privacy-preserving rental solvency verification application built on the Midnight Network.
</p>

---

## Overview

**RentProof** is a privacy-preserving rental solvency application built on the **Midnight Network**.

RentProof allows a tenant to prove that they meet a required rental affordability threshold without revealing their actual financial balance.

The application uses a **Compact smart contract** and **zero-knowledge proofs** to verify the solvency condition while keeping the underlying financial value private.

### Core Principle

> **Prove the requirement. Don't reveal the balance.**

---

## The Problem

When applying for rental accommodation, tenants may be required to demonstrate that they can afford the rent.

Traditional verification can require the disclosure of sensitive financial information such as:

- Bank balances
- Financial statements
- Income information
- Other private financial details

However, a landlord generally needs to know whether the affordability requirement is satisfied, not the tenant's exact financial balance.

RentProof changes this model. Instead of revealing the financial value, the tenant proves that the required condition has been satisfied.

---

## The Solution

RentProof generates a privacy-preserving solvency proof. The proof is submitted to a Midnight Compact smart contract, which verifies the condition and produces an eligibility result.

For example:

    Required threshold: 3
    Result: ELIGIBLE

The underlying financial balance is not revealed as part of the eligibility result.

---

## How It Works

    TENANT
      |
      | Private financial information
      v
    RentProof App
      |
      | Zero-Knowledge Proof
      v
    Midnight Compact Smart Contract
      |
      | Verification
      v
    ELIGIBLE / NOT ELIGIBLE

The key distinction is that RentProof verifies the condition, rather than exposing the underlying financial value.

---

## Core Smart Contract

RentProof's Compact contract contains two core circuits.

**setThreshold** -- Sets the rental affordability threshold used for verification.

**proveSolvency** -- Processes the solvency proof and determines whether the private financial condition satisfies the configured threshold.

---

## Midnight Integration

RentProof is built specifically for the Midnight Network and uses its privacy-preserving smart contract infrastructure.

### Technology Stack

- Midnight Network
- Compact
- Zero-knowledge proofs
- Midnight.js
- Midnight DApp Connector API
- 1AM Wallet
- Midnight Proof Server
- React
- TypeScript
- Vite
- Docker

### Verified Midnight Package Versions

| Package | Version |
|---|---|
| @midnight-ntwrk/midnight-js-contracts | 4.1.1 |
| @midnight-ntwrk/midnight-js-http-client-proof-provider | 4.1.1 |
| @midnight-ntwrk/midnight-js-indexer-public-data-provider | 4.1.1 |
| @midnight-ntwrk/midnight-js-protocol | 4.1.1 |
| @midnight-ntwrk/midnight-js-network-id | 4.1.1 |
| @midnight-ntwrk/wallet-sdk | 1.2.0 |
| @midnight-ntwrk/compact-js | 2.5.1 |
| @midnight-ntwrk/ledger-v8 | 8.1.0 |
| @midnight-ntwrk/dapp-connector-api | 4.0.1 |

The complete resolved dependency tree is recorded in package-lock.json.

---

## 1AM Wallet

RentProof is designed to connect through the 1AM Wallet using the Midnight DApp Connector API. The frontend specifically searches for the 1AM wallet and does not fall back to another wallet.

---

## Verified Midnight Preprod Deployment

RentProof has been successfully compiled, deployed, and tested on the Midnight Preprod network.

**Contract Address:** 0x57e370728a820cdb13386b9a330c29ea8d546a2cdf15aaef778798f752b22c

**Threshold Transaction:** 034e8af4693ea70bbe2cecf1f78321ec281599390557e29a1cb7694350ee5a795

**Solvency Proof Transaction:** 00d4f58e4271584e843d6aee135bf13da80ad79940d6b9f7d3537fb594a796d299

**Successful Verification:**

    Required threshold: 3
    Solvency status: ELIGIBLE

The successful Preprod test demonstrated that RentProof can submit and verify a solvency proof and return an eligibility result without revealing the underlying financial balance.

---

## Privacy Model

RentProof is built around a simple privacy principle: the eligibility result can be verified without exposing the underlying financial value.

Instead of sharing an exact financial balance, RentProof provides a result such as ELIGIBLE. This minimizes unnecessary disclosure of sensitive financial information.

---

## User Flow

    1. Connect 1AM Wallet
    2. Enter rental requirement
    3. Generate solvency proof
    4. Submit proof to Midnight
    5. Verify proof
    6. Receive eligibility result

The application intentionally focuses on this single use case rather than adding unnecessary features.

---

## Frontend

RentProof includes a lightweight React frontend designed around the core verification workflow.

**Frontend Features**

- 1AM Wallet connection
- Midnight Preprod network connection
- Rental affordability verification interface
- Privacy-focused eligibility result
- Simple user experience
- No unnecessary account or financial-data dashboard

Built with React, TypeScript, Vite, and the Midnight DApp Connector API.

---

## Project Structure

    RentProof/
    |-- contracts/
    |   `-- rentproof.compact
    |-- src/
    |   |-- deploy.ts
    |   |-- network.ts
    |   `-- ...
    |-- frontend/
    |   `-- src/
    |       |-- App.tsx
    |       |-- App.css
    |       |-- index.css
    |       `-- main.tsx
    |-- tests/
    |-- docker-compose.yml
    |-- package.json
    |-- package-lock.json
    |-- README.md
    `-- LICENSE

---

## Getting Started

### Requirements

- Node.js
- npm
- Docker
- 1AM Wallet
- Midnight Preprod access

### Clone the Repository

    git clone https://github.com/agenticfinance-dev/RentProof.git
    cd RentProof

### Install Dependencies

    npm install

### Start the Proof Server

    docker compose up -d proof-server

### Build the Frontend

    cd frontend
    npm install
    npm run build

### Start the Frontend

    npm run dev

Open the application in a Midnight-compatible browser environment with the 1AM Wallet available.

---

## Security

RentProof is designed to minimize exposure of sensitive financial information.

Wallet recovery phrases, private keys, generated wallet state, deployment state, and other sensitive credentials must never be committed to the repository. Sensitive local development and wallet-state files are excluded from version control.

The repository does not require users to publish their private financial balance as part of the eligibility result.

---

## Buildathon Focus

RentProof focuses on one clear privacy use case: a tenant can prove they meet a rental affordability requirement without revealing their bank balance.

The project prioritizes a working privacy-preserving implementation over unnecessary application complexity.

---

## Why Midnight?

RentProof is designed around a problem where privacy is central. Financial information is highly sensitive, while rental verification often only requires a yes-or-no answer.

Midnight's privacy-preserving smart contract infrastructure provides a suitable foundation for proving that a condition has been satisfied without unnecessarily exposing the underlying information.

---

## License

Copyright (c) 2026 Agentic Finance Studio

Licensed under the Apache License, Version 2.0. See the LICENSE file for the complete license text.

---

## Repository

**RentProof** -- Privacy-preserving rental solvency verification on Midnight

GitHub: https://github.com/agenticfinance-dev/RentProof
