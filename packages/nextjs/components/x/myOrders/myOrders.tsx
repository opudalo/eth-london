import styles from "./myOrders.module.css";
import { Order } from "~~/app/page";

const OrderItem: React.FC<Order> = x => {
  return (
    <div className={styles.orderItem}>
      <div>Order ID: {x.id}</div>
      <div>Liquidity Pool: {x.liquidityPool}</div>
      <div>Is Buy Operation: {x.isBuyOperation ? "Yes" : "No"}</div>
      <div>Token 1 Initial Amount: {x.token1InitialAmount}</div>
      <div>Token 1 Amount: {x.token1Amount}</div>
      <div>Token 2 Amount: {x.token2Amount}</div>
      <div>Number of Iterations Left: {x.numberOfIterationsLeft}</div>
      <div>Initial Iterations: {x.initialIterations}</div>
      <div>Frequency: {x.frequency}</div>
    </div>
  );
};

export const MyOrders: React.FC<{ orders: Order[] }> = ({ orders }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.title}>My Orders</div>

      <div className={styles.list}>
        {orders.map(x => (
          <OrderItem {...x} />
        ))}
      </div>
    </div>
  );
};
