import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";

@Entity()
export class OrderItem {

    @PrimaryGeneratedColumn()
    order_item_id!: number;

    @ManyToOne(() => Order, order => order.orderItems)
    order!: Order;

    @ManyToOne(() => Product)
    product!: Product;

    @Column()
    quantity!: number;

    @Column("decimal")
    price_at_purchase!: number;
}
