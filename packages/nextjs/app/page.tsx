"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import "./index.css";
import $ from "./page.module.css";
import { Atom, F, ReadOnlyAtom, classes } from "@grammarly/focal";
import type { NextPage } from "next";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { CakeTestToken, Dexs, TestUniLiquidityPool, TestTokens, UniTestToken, UniswapSepolia, WETHTestToken } from "~~/components/stub-data";
import { formatNum, times } from "~~/components/utils";
import { Button } from "~~/components/x/button";
import { Input } from "~~/components/x/input";
import { Select } from "~~/components/x/select";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export interface LiquidityPool {
  addr: string;
  token1: string;
  token1Symbol: string;
  token2: string;
  token2Symbol: string;
  currentPrice: number;
}

export interface OrderFormState {
  liquidityPool: LiquidityPool;
  // "buy" is to buy token1,
  // "sell" is to sell token1
  operation: "buy" | "sell";
  amount: number;
  frequency: number;
  commitedFunds: number;
}

/* change fields in whatever way.
 * so that they are compatible with
 * our contract */
export interface Order {
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

export interface APIRATEONFIRE {
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

function getTokenBalanceOfUser(userAddress: string, tokenAddress: string) {
  const {
    data: balance,
    isError,
    isLoading,
  } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [userAddress],
  });

  return !!balance ? Number(balance) / 1e18 : 0;
}

function getOrdersHistory(address: string) {
  const { data: requestLength } = useScaffoldContractRead({
    contractName: "DcaExecutor",
    functionName: "completedRequestsLength",
    args: [address],
  });

  const requestHistory = [];
  for (let i = 0; i < Number(requestLength); i++) {
    const { data: request } = useScaffoldContractRead({
      contractName: "DcaExecutor",
      functionName: "dcaRequestsCompleted",
      args: [address, BigInt(i)],
    });
    requestHistory.push(request);
  }
  return requestHistory;
}

function getActiveOrders(address: string) {
  const { data: requestLength } = useScaffoldContractRead({
    contractName: "DcaExecutor",
    functionName: "activeRequestsLength",
    args: [address],
  });

  const requestHistory = [];
  for (let i = 0; i < Number(requestLength); i++) {
    const { data: request } = useScaffoldContractRead({
      contractName: "DcaExecutor",
      functionName: "dcaRequests",
      args: [address, BigInt(i)],
    });
    requestHistory.push(request);
  }
  return requestHistory;
}

function submitOrder(
  token1: string,
  token2: string,
  token1Amount: number,
  numberOfSwaps: number,
  swapExecutionPeriod: number,
  startTimestamp: number,
  endTimestamp: number,
) {
  const { writeAsync: submitOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "submitDcaRequest",
    args: [
      token1,
      token2,
      BigInt(token1Amount * 1e18),
      "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
      BigInt(numberOfSwaps),
      BigInt(swapExecutionPeriod),
      BigInt(startTimestamp),
    ],
  });
}

function cancelOrder(receiver: string, requestIndex: number) {
  const { writeAsync: cancelOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "cancelDcaRequest",
    args: [receiver, BigInt(requestIndex)],
  });
}

function cancelLastOrder(receiver: string) {
  const { data: requestLength } = useScaffoldContractRead({
    contractName: "DcaExecutor",
    functionName: "activeRequestsLength",
    args: [receiver],
  });

  const { writeAsync: cancelLastOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "cancelDcaRequest",
    args: [receiver, requestLength!! - BigInt(1)],
  });
}

function callExecuteOnOrder(receiver: string, requestIndex: number) {
  const { writeAsync: callExecuteOnOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "executeSwap",
    args: [receiver, BigInt(requestIndex)],
  });
}

function callExecuteOnLastOrder(receiver: string) {
  const { data: requestLength } = useScaffoldContractRead({
    contractName: "DcaExecutor",
    functionName: "activeRequestsLength",
    args: [receiver],
  });

  const { writeAsync: callExecuteOnLastOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "executeSwap",
    args: [receiver, requestLength!! - BigInt(1)],
  });
}

const getDefaultOrderFormState = (liquidityPool: LiquidityPool): OrderFormState => ({
  liquidityPool,
  operation: "buy",
  amount: 3,
  frequency: 1000 * 60 * 60, // 1 hour
  commitedFunds: getTokenBalanceOfUser(
    "0xE2eE625D83C68123aCa4251d6a82f23b70d9eEE3",
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  ),
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

const getLiquidtyPoolFromAddress = (addr: string): LiquidityPool => {
  // todo - implement properly
  return {} as any;
};

const myBalance = {
  [UniTestToken.addr]: 100,
  [WETHTestToken.addr]: 4,
  [CakeTestToken.addr]: 200
};

type Balance = typeof myBalance;

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return <XXX />;
};

const ContractSubmitter: React.FC<{ orderFormState: OrderFormState }> = ({ orderFormState }) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("DcaExecutor");
  const { writeAsync: submitOrder } = useScaffoldContractWrite({
    contractName: "DcaExecutor",
    functionName: "submitDcaRequest",
    args: [
      orderFormState.operation === "buy" ? WETHTestToken.addr : UniTestToken.addr,
      orderFormState.operation === "buy" ? UniTestToken.addr : WETHTestToken.addr,
      BigInt(orderFormState.commitedFunds * 1e18),
      "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
      BigInt(orderFormState.amount),
      BigInt(orderFormState.frequency / 1000),
      BigInt(0),
    ],
  });

  if (deployedContractLoading) {
    return (
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  } else {
    return (
      <div>
        <Button
          size="large"
          onClick={() => {
            submitOrder();
          }}
        >
          Submit order
        </Button>
      </div>
    );
  }
};
const XXX = () => {
  const tokenContractAddress = Atom.create<string>(UniTestToken.addr);
  const orderFormState = Atom.create<OrderFormState>(getDefaultOrderFormState(TestUniLiquidityPool));
  const isSubmitted = Atom.create(false);
  const dexRouter = Atom.create<string>(UniswapSepolia.router);

  return (
    <>
      <div className="flex flex-col flex-grow x-main-container">
        <F.div className={$.wrap}>
          <F.div className={$.orderForm}>
            <F.div className={$.textOrder}>
              <div className={$.line}>
                As a <b>"Dollar Chad Average"</b> user
              </div>
              <div className={$.line}>
                I want to{" "}
                <Select value={orderFormState.lens("operation")} size="large">
                  <option value={"buy"}>Buy</option>
                  <option value={"sell"}>Sell</option>
                </Select>{" "}
                <Select value={tokenContractAddress} size="large">
                  {TestTokens.filter(x => x.symbol !== "WETH").map((x, i) => (
                    <option key={i} value={x.addr}>
                      {x.symbol} ({x.addr.substring(0, 6)}…{x.addr.substring(x.addr.length - 4)})
                    </option>
                  ))}
                </Select>{" "}
                tokens{" "}
              </div>
              <div className={$.line}>
                every{" "}
                <Select size={"large"} value={orderFormState.lens("frequency")}>
                  {Object.entries(times).map(([lbl, val], inx) => (
                    <option key={inx} value={val}>
                      {lbl}
                    </option>
                  ))}
                </Select>{" "}
                 on {" "}
                 <Select value={dexRouter} size="large">
                  {Dexs.map((x, i) => (
                    <option key={i} value={x.router}>
                      {x.name}
                    </option>
                  ))}
                </Select>
                , making a total of{" "}
                <Input size="large" type="number" value={orderFormState.lens("amount")} className={$.resizeableInput} />{" "}
                trades.
              </div>
              <F.div className={$.line}>
                Until{" "}
                {orderFormState.lens("operation").view(x =>
                  x === "buy" ? (
                    <>
                      I spent{" "}
                      <F.span className={$.inputResizer}>
                        <F.span className={$.ghostValue}>{orderFormState.lens("commitedFunds").view(formatNum)}</F.span>{" "}
                        <Input
                          size="large"
                          type="number"
                          value={orderFormState.lens("commitedFunds")}
                          className={$.resizeableInput}
                        />{" "}
                      </F.span>{" "}
                      WETH or my WETH balance is empty.
                    </>
                  ) : (
                    <>
                      I sold{" "}
                      <F.span className={$.inputResizer}>
                        <F.span className={$.ghostValue}>{orderFormState.lens("commitedFunds").view(formatNum)}</F.span>{" "}
                        <Input
                          size="large"
                          type="number"
                          value={orderFormState.lens("commitedFunds")}
                          className={$.resizeableInput}
                        />{" "}
                      </F.span>{" "}
                      UNI or my UNI balance is empty.
                    </>
                  ),
                )}
              </F.div>
            </F.div>
            <div className={$.actionButton}>
              <F.Fragment>
                {isSubmitted.view(x =>
                  x ? (
                    <ContractSubmitter orderFormState={orderFormState.get()} />
                  ) : (
                    <Button
                      size="large"
                      onClick={() => {
                        console.log(orderFormState.get());
                        isSubmitted.set(true);
                        // (window as any)
                        // .xxxx();
                      }}
                    >
                      Submit order
                    </Button>
                  ),
                )}
              </F.Fragment>
            </div>
            <br />
          </F.div>
          {/* <div>
            <MyOrders orders={ordersStub} />
          </div> */}
        </F.div>
      </div>
    </>
  );
};

export default Home;
