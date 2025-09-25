import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { Order } from "./Order";


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