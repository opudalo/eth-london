"use client";

import { PropsWithChildren, useEffect } from "react";
import "./index.css";
import $ from "./page.module.css";
import { Atom, F, ReadOnlyAtom, classes } from "@grammarly/focal";
import type { NextPage } from "next";
import numbro from "numbro";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { Button } from "~~/components/x/button";
import { Input } from "~~/components/x/input";
import { InputField } from "~~/components/x/inputField";
import { Select } from "~~/components/x/select";
import { Switcher } from "~~/components/x/switcher";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

interface LiquidityPool {
  addr: string;
  token1: string;
  token1Symbol: string;
  token2: string;
  token2Symbol: string;
  currentPrice: number;
}

interface OrderFormState {
  liquidityPool: LiquidityPool;
  // "buy" is to buy token1,
  // "sell" is to sell token1
  isBuyOperation: boolean;
  amount: number;
  frequency: number;
  commitedFunds: number;
}

/* change fields in whatever way.
 * so that they are compatible with
 * our contract */
interface Order {
  id: string;
  liquidityPool: string;
  isBuyOperation: boolean;
  token1InitialAmount: number;
  token1Amount: number;
  token2Amount: number;
  numberOfIterationsLeft: number;
  initialIterations: number;
  frequency: number;
}

interface APIRATEONFIRE {
  getLiquidityPoolMetadata: (addr: string) => Promise<LiquidityPool>;

  // get all orders for address,
  // would be pulled from our ETH history, not from our contract.
  // As our contract cleans up orders which finished it's execution
  getOrdersHistory: (addr: string) => Promise<Order[]>;

  // get all active orders for address
  getActiveOrders: (addr: string) => Promise<Order[]>;

  // Submit DCA order to contract
  submitOrder: (order: OrderFormState) => Promise<Order>;

  // Call contract to cancel order
  cancelOrder: (order: Order) => Promise<void>;

  // This is our cron job to call executor in our contract
  // Smart way would to have it on server, but that'll do for now
  callExecuteOnContract: (receiverAddress: string, index: number) => Promise<void>;
}

function ReadUniBalance() {
  const { data: balance, isError, isLoading } = useContractRead({
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: ['0xE2eE625D83C68123aCa4251d6a82f23b70d9eEE3']
  })

  return !!balance ? Number(balance) / 1e18 : 0
}

function ReadWethBalance() {
  const { data: balance, isError, isLoading } = useContractRead({
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: ['0xE2eE625D83C68123aCa4251d6a82f23b70d9eEE3']
  })

  return !!balance ? Number(balance) / 1e18 : 0
}

function getOrdersHistory(address: string) {
  const { data: requestLength } = useScaffoldContractRead({
    contractName: 'DcaExecutor',
    functionName: 'completedRequestsLength',
    args: [
      address
    ]
  })
  
  const requestHistory = []
  for (let i = 0; i < Number(requestLength); i++) {
    const { data: request } = useScaffoldContractRead({
      contractName: 'DcaExecutor',
      functionName: 'dcaRequestsCompleted',
      args: [
        address,
        BigInt(i)
      ]
    })
    requestHistory.push(request)
  }
  return requestHistory
}

function getActiveOrders(address: string) {
  const { data: requestLength } = useScaffoldContractRead({
    contractName: 'DcaExecutor',
    functionName: 'activeRequestsLength',
    args: [
      address
    ]
  })
  
  const requestHistory = []
  for (let i = 0; i < Number(requestLength); i++) {
    const { data: request } = useScaffoldContractRead({
      contractName: 'DcaExecutor',
      functionName: 'dcaRequests',
      args: [
        address,
        BigInt(i)
      ]
    })
    requestHistory.push(request)
  }
  return requestHistory
}

function submitOrder(token1: string, token2: string, token1Amount: number, numberOfSwaps: number, swapExecutionPeriod: number, startTimestamp: number, endTimestamp: number) {
  const { writeAsync: submitOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "submitDcaRequest",
    args: [
      token1,
      token2,
      BigInt(token1Amount * 1e18),
      '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
      BigInt(numberOfSwaps),
      BigInt(swapExecutionPeriod),
      BigInt(startTimestamp)
    ]
  })
}

function cancelOrder(receiver: string, requestIndex: number) {
  const { writeAsync: cancelOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "cancelDcaRequest",
    args: [
      receiver,
      BigInt(requestIndex)
    ]
  })
}

function cancelLastOrder(receiver: string) {
  const { data: requestLength } = useScaffoldContractRead({
    contractName: 'DcaExecutor',
    functionName: 'activeRequestsLength',
    args: [
      receiver
    ]
  })
  
  const { writeAsync: cancelLastOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "cancelDcaRequest",
    args: [
      receiver,
      requestLength!! - BigInt(1)
    ]
  })
}

function callExecuteOnOrder(receiver: string, requestIndex: number) {
  const { writeAsync: callExecuteOnOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "executeSwap",
    args: [
      receiver,
      BigInt(requestIndex)
    ]
  })
}

function callExecuteOnLastOrder(receiver: string) {
  const { data: requestLength } = useScaffoldContractRead({
    contractName: 'DcaExecutor',
    functionName: 'activeRequestsLength',
    args: [
      receiver
    ]
  })
  
  const { writeAsync: callExecuteOnLastOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "executeSwap",
    args: [
      receiver,
      requestLength!! - BigInt(1)
    ]
  })
}


const getDefaultOrderFormState = (liquidityPool: LiquidityPool): OrderFormState => ({
  liquidityPool,
  isBuyOperation: true,
  amount: ReadUniBalance(),
  frequency: 1000 * 60 * 60, // 1 hour
  commitedFunds: 0,
});

const Step: React.FC<
  PropsWithChildren<{
    active?: ReadOnlyAtom<boolean>;
    title: string;
  }>
> = ({ children, title, active }) => {
  return (
    <F.div {...classes($.step, active === undefined || !!active ? $.active : null)}>
      <div {...classes($.stepTitle)}>{title}</div>
      {children}
    </F.div>
  );
};

const formatInputValue = {
  thousandSeparated: true,
  // average: true,
  optionalMantissa: true,
  trimMantissa: true,
  mantissa: 3,
};

const formatNum = (x: number) => (x ? numbro(x).format(formatInputValue) : x.toString());

const min = 60 * 1000;
const hour = 60 * min;
const day = 24 * hour;

const times = {
  "1 min": min,
  "10 min": 10 * min,
  "15 min": 15 * min,
  "30 min": 30 * min,
  "1 hour": hour,
  "4 hours": 4 * hour,
  "12 hours": 12 * hour,
  "1 day": day,
  "1 week": 7 * day,
};

const PepeCoin: LiquidityPool = {
  addr: "0xddd23787a6b80a794d952f5fb036d0b31a8e6aff",
  token1: "0xa9e8acf069c58aec8825542845fd754e41a9489a",
  token1Symbol: "PEPE",
  token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  token2Symbol: "ETH",
  currentPrice: 0.000045,
};

const ETHUSDT: LiquidityPool = {
  // ETH/USDT
  addr: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
  // ETH
  token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  token1Symbol: "ETH",
  // USDT
  token2: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  token2Symbol: "USDT",
  currentPrice: 3669.45,
};

const getLiquidtyPoolFromAddress = (addr: string): LiquidityPool => {
  // todo - implement properly
  return {} as any;
};

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const lp = Atom.create<string>("0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852");
  const orderFormState = Atom.create<OrderFormState>(
    getDefaultOrderFormState(Math.random() > 0.5 ? ETHUSDT : PepeCoin),
  );

  useEffect(() => {
    lp.subscribe(x => {
      debugger
      console.log(x);
      setTimeout(() => {
        // todo - implement properly
        const getLiquidityPoolMetadata = (addr: string): LiquidityPool => {
          return orderFormState.get().liquidityPool?.addr === PepeCoin.addr ? ETHUSDT : PepeCoin;
        };
        orderFormState.set(getDefaultOrderFormState(getLiquidityPoolMetadata(x)));
      }, 500);
    });
  }, []);

  return (
    <>
      <div className="flex flex-col flex-grow pt-10 x-main-container">
        <div className="px-5">
          <div className="flex items-center space-x-2">
            <p>Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <F.div className={$.orderForm}>
          <div className={$.title}>Dollar Chad Average</div>
          <Step title="Select Liquidity Pool">
            <Input type="text" size={"large"} style={{ width: "100%" }} value={lp} />
          </Step>
          <Step title="Configure your order">
            <div className={$.orderType}>
              <span className={$.operation}>Buy</span>
              <Switcher size={"large"} state={orderFormState.lens("isBuyOperation")} />
              <span className={$.operation}>Sell</span>
            </div>

            <InputField label="Amount to spend">
              <Input
                type="number"
                value={ReadUniBalance}
                customValueWhenBlurred={orderFormState.lens("amount").view(formatNum)}
              />
            </InputField>
            <InputField label="Frequency (every)">
              <Select value={orderFormState.lens("frequency")}>
                {Object.entries(times).map(([lbl, val], inx) => (
                  <option key={inx} value={val}>
                    {lbl}
                  </option>
                ))}
              </Select>
            </InputField>
            <InputField label="Committed Funds">
              <Input
                type="number"
                value={orderFormState.lens("commitedFunds")}
                customValueWhenBlurred={orderFormState.lens("commitedFunds").view(formatNum)}
              />
            </InputField>
          </Step>
          <div>
            <Button
              onClick={() => {
                console.log(orderFormState.get());
              }}
            >
              Submit order
            </Button>
          </div>
        </F.div>
      </div>
    </>
  );
};

export default Home;
