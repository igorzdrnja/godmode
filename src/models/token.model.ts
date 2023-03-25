export type NetworkUsed = 'homestead'|'mainnet'|'ropsten'|'rinkeby'|'kovan'|'goerli'

export interface Token {
  network?: NetworkUsed;
  address: string;
  threshold: number;
  abi?: Array<string>|string;
}

