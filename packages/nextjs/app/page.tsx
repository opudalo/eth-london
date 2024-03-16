"use client";

import { PropsWithChildren, useEffect } from "react";
import "./index.css";
import $ from "./page.module.css";
import { Atom, F, ReadOnlyAtom, classes } from "@grammarly/focal";
import type { NextPage } from "next";
import numbro from "numbro";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { Button } from "~~/components/x/button";
import { Input } from "~~/components/x/input";
import { InputField } from "~~/components/x/inputField";
import { Select } from "~~/components/x/select";
import { Switcher } from "~~/components/x/switcher";

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

const getDefaultOrderFormState = (liquidityPool: LiquidityPool): OrderFormState => ({
  liquidityPool,
  isBuyOperation: true,
  amount: 0,
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
      console.log(x);
      setTimeout(() => {
        // todo - implement properly
        const getLiquidityPoolFromAddress = (addr: string): LiquidityPool => {
          return orderFormState.get().liquidityPool?.addr === PepeCoin.addr ? ETHUSDT : PepeCoin;
        };
        orderFormState.set(getDefaultOrderFormState(getLiquidityPoolFromAddress(x)));
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

            <InputField label="Amount">
              <Input
                type="number"
                value={orderFormState.lens("amount")}
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
