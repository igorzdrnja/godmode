export interface Token {
  network: string;
  address: string;
  threshold: number;
  abi: Array<string>|string;
  symbol: string;
}

