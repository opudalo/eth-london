import { times } from "./utils";
import { Order } from "~~/app/page";

export interface LiquidityPool {
  addr: string;
  token1: string;
  token1Symbol: string;
  token2: string;
  token2Symbol: string;
  currentPrice: number;
}

export interface Token {
  addr: string;
  symbol: string;
}

export const UniTestToken = {
  addr: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  symbol: "UNI",
};

export const WETHTestToken = {
  addr: "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
  symbol: "WETH",
};

export const TestUniLiquidityPool: LiquidityPool = {
  addr: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
  token1: UniTestToken.addr,
  token1Symbol: UniTestToken.symbol,
  token2: WETHTestToken.addr,
  token2Symbol: WETHTestToken.symbol,
  currentPrice: 0.04,
};

export const TestTokens: Token[] = [UniTestToken, WETHTestToken];

export const ordersStub: Order[] = [
  {
    id: "124t478123",
    liquidityPool: "0x1234...5678",
    isBuyOperation: true,
    token1InitialAmount: 1,
    token1Amount: 0.4,
    token2Amount: 34252981,
    numberOfIterationsLeft: 3,
    initialIterations: 10,
    frequency: times["10 min"],
  },

  // add 4 more orders
  {
    id: "9876abcd",
    liquidityPool: "0xabcd...efgh",
    isBuyOperation: false,
    token1InitialAmount: 0.5,
    token1Amount: 0.2,
    token2Amount: 12345678,
    numberOfIterationsLeft: 5,
    initialIterations: 8,
    frequency: times["15 min"],
  },
  {
    id: "5678efgh",
    liquidityPool: "0x5678...abcd",
    isBuyOperation: true,
    token1InitialAmount: 2,
    token1Amount: 0.8,
    token2Amount: 98765432,
    numberOfIterationsLeft: 2,
    initialIterations: 6,
    frequency: times["15 min"],
  },
  {
    id: "abcd1234",
    liquidityPool: "0xefgh...5678",
    isBuyOperation: false,
    token1InitialAmount: 0.3,
    token1Amount: 0.1,
    token2Amount: 87654321,
    numberOfIterationsLeft: 4,
    initialIterations: 12,
    frequency: times["30 min"],
  },
  {
    id: "efgh5678",
    liquidityPool: "0xabcd...1234",
    isBuyOperation: true,
    token1InitialAmount: 1.5,
    token1Amount: 0.6,
    token2Amount: 23456789,
    numberOfIterationsLeft: 1,
    initialIterations: 4,
    frequency: times["1 hour"],
  },
];
