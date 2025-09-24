import { OrderItem } from "./OrderItem";
import { User } from "./User";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";

@Entity("orders")
export class Order {

    @PrimaryGeneratedColumn()
    order_id!: number;

    @ManyToOne(() => User)
    user!: User;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    order_date!: Date;

    @Column()
    status!: string;

    @Column("decimal")
    total_amount!: number;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    orderItems!: OrderItem[];
}