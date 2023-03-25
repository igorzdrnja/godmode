import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { Token } from '../models/token.model';
import * as fs from 'fs';
import * as path from 'path';
import { Network, Alchemy, OwnedToken } from 'alchemy-sdk';

@Injectable()
export class WalletService {
  private readonly tokens: Record<string, Token>;

  /**
   * @return {WalletService}
   * @constructor
   */
  constructor() {
    this.tokens = {};
  }

  /**
   * Get token data from the local csv file
   *
   * @returns { Alchemy } - Alchemy provider instance
   */
  readTokenRequests() {
    // Read token input data from the local tokens.csv file
    const filePath = path.join(process.cwd(), 'src/tokens.csv');
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    const lines = fileContent.trim().split('\n');
    for (let i = 0; i < lines.length; i++) {
      const [address, symbol, _, t, network] = lines[i].split(',');

      let threshold = parseInt(t);
      if (isNaN(threshold)) {
        // Generate random threshold between 0 and predefined value if it's missing for the
        // token in the csv data. Fallback to 1000 tokens
        threshold = Math.floor(Math.random() * (parseFloat(process.env.MAX_RANDOM_THRESHOLD_USED) || 1000));
      }
      this.tokens[symbol.toUpperCase()] = <Token>{
        address,
        abi: 'ERC-20',
        threshold,
        network,
      };
    }
  }

  /**
   * Get Alchemy provider with fallback to 'demo' Alchemy API key
   *
   * @returns { Alchemy } - Alchemy provider instance
   */
  getProvider() {
    const settings = {
      apiKey: process.env.PROVIDER_KEY || 'demo',
      network: Network.ETH_MAINNET,
    };
    return new Alchemy(settings);
  }

  /**
   * Get all the token information for the wallet address using Alchemy's enhanced API getTokensForOwner request.
   *
   * @param {string} address
   * @param {string} provider
   * @returns {OwnedToken[]} data - token data
   */
  async getAllTokenData(address, provider) {
    let tokenRes = await provider.core.getTokensForOwner(address);
    let data = tokenRes.tokens;
    // Get all the token balances (as max. 100 tokens are retrieved per request)
    while (tokenRes.pageKey) {
      tokenRes = await provider.core.getTokensForOwner(
        address,
        { pageKey: tokenRes.pageKey },
      );
      data = [...data, ...tokenRes.tokens];
    }
    return data;
  }

  /**
   * Get token balances as dictionary, from the owned tokens array
   *
   * @param {string} balances
   * @returns {Record<string, number>} balanceDict
   */
  getBalancesDict(balances) {
    const balanceDict = Object.create(null);
    balances.forEach((entry) => {
      balanceDict[entry['symbol']] = entry['balance'];
    });
    return balanceDict;
  }

  /**
   * Classify wallet address on each of the predefined tokens.
   * Returns token GodLike status, specified threshold and the balance per token.
   *
   * @param {string} address
   * @returns {Record<string, string|number>} classifications
   */
  async classifyWallet(address) {
    try {
      if (!ethers.utils.isAddress(address)) {
        throw new Error('Invalid wallet address');
      }
      const provider = this.getProvider();
      let balances = await this.getAllTokenData(address, provider);

      // Better classification efficiency in case of large number of tokens in a wallet
      balances = this.getBalancesDict(balances);

      // Decide GodMode per token, balance and the threshold
      const classifications = {};
      for (const symbol of Object.keys(this.tokens)) {
        classifications[symbol] = {
          classification: parseFloat(balances[symbol]) > this.tokens[symbol].threshold ? 'GodMode' : 'Not GodMode',
          threshold: this.tokens[symbol].threshold,
          balance: parseFloat(balances[symbol]),
        };
      }
      return classifications;
    } catch (e) {
      console.log('Error while processing token balances: ', e.body || e);
      return {
        error: e.reason || 'Token classification error',
      };
    }
  }
}
