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
---

## Verified Midnight Preprod Deployment

RentProof has been deployed and exercised on Midnight Preprod.

### Contract Address

0x0e57e370728a820cd61596669a330c29ea8d646a2cdf15aaaf778798f752b22c

### Transaction 1 — setThreshold

Transaction Hash: 0xb3cf8128c8b10bef6ce71d8c5ec1d1b81ee69f2de96e778ca92063c02ed3e845

- Block: #2,387,011
- Block Hash: 0xdf6ae68813e76a269d10e4ad3e00423e3056577a3476166fdbf9aecebac23414
- Timestamp: Sep 3, 2026, 11:24:24 AM UTC
- Status: SUCCESS

### Contract Deployment

Deployment Transaction: 0xff47ab836fec82540ab9bfcc546c75805d6c56128019e884ec623e0051b9a8d0

- Block: #2,387,047
- Block Hash: 0x19b5b1ffcf6d905bdbc1d268893cef7e5540f69ff8c7bc10284d70f944ad5d9a
- Parent Hash: 0xc7d32736dfdc8c879a6ab388db60b630711e86d0324dfe9670a3f6b86083d5c7
- Timestamp: Sep 3, 2026, 11:28:00 AM UTC
- Status: Finalized

### Solvency Proof Result

Transaction ID: 00d4f58e4271584e843d6aee135bf13da80ad79940d6b9f7d3537fb594a796d299

- Status: ELIGIBLE
- Required threshold: 3

## Project Resources

- GitHub: https://github.com/agenticfinance-dev/RentProof
- Slide Deck: https://docs.google.com/presentation/d/16UKrkWeHSsEpjdDlVQnhceCwdnFIDTozRm78m4sLUKI/edit?usp=drivesdk
- 1AM Explorer Evidence: https://explorer.1am.xyz/block/2387047

## Buildathon Compliance Notes

- The Midnight-related code (Compact contract, CLI, deployment scripts) was newly developed for this project.
- The Compact contract compiles successfully with Compact 0.31.1.
- The repository is licensed under Apache License 2.0.
- The public repository carries the required `midnightntwrk` topic.
- The contract is deployed and tested on Midnight Preprod with verifiable on-chain transactions.
- The live frontend is deployed publicly and includes 1AM Wallet DApp Connector integration.
- The slide deck and demo video are included in the submission.

---

## Judge Quickstart

| Step | Action | What to verify |
|---|---|---|
| 2 | Open the GitHub repository | Compact contract, frontend, CLI and deployment code |
| 3 | Review the Verified Midnight Preprod Deployment above | Deployed contract and verified transactions |
| 4 | Open the 1AM Explorer evidence above | Deployment block #2,387,047 |
| 5 | Review the Subscan evidence below | Finalized Midnight Preprod block #2,387,011 |
| 6 | Review the Solvency Proof Result above | `ELIGIBLE` with required threshold `3` |

### Core Value

RentProof lets a renter prove that their private balance meets a required rent threshold without revealing the actual balance.

## Privacy Model

| Data | Visibility |
|---|---|
| Renter's actual balance | **Private** |
| Balance witness | **Private** |
| Required rent threshold | **Public** |
| Verification result | **Public** |
| On-chain transaction evidence | **Public** |

RentProof uses a private witness for the renter's balance. The verification result establishes whether the private balance satisfies the required threshold without publicly revealing the actual balance.

## Additional Midnight Preprod Evidence

### Subscan — Block #2,387,011

- Timestamp: **September 3, 2026, 11:24:24 UTC**
- Status: **Finalized**
- Block Hash:
  `0xdf6ae68813e76a269d10e4ad3e00423e3056577a3476166fdbf9aecebac23414`
- Parent Hash:
  `0x46935dd46fa711c4db7e8873fc7f2c83b476350243d1fda1aecd8b0c7426b3f1`
- State Root:
  `0x70b2e7837799025a90a318a64c60bd3a05f822de901b1ad9ff98663cc39c8d01`
- Extrinsics Root:
  `0x1c8011bbed54a674325a83c0c4067e2152c0c198a6977b375aa2a3deaff73c75`
- Validator:
  `mn_addr_preprod13382wavjxcl49h2hw377gx9ca37vpjl5qudjkgy6gql7ect9lgzstlkcmm`
- Spec Version: `1000000`

## Testing

Run the project test suite with:

    npm test

The repository also includes setup, deployment, CLI and end-to-end verification workflows used during Preprod testing.

## Wave Roadmap

### Wave 2 — Verifiable Privacy-Preserving Rental Proofs
- Landlord/verifier workflow
- Proof receipt or identifier
- Proof expiry/freshness
- Improved 1AM Wallet and frontend UX
- Further privacy improvements

### Wave 3 — Complete Privacy-Preserving Rental Verification
- Renter-to-landlord verification workflow
- Reusable privacy-preserving proofs
- Multiple rental requirements
- Verification history
- Production-ready UX
- Security and privacy review
