import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { Cart } from "./Cart";

@Entity()
export class CartItem {

    @PrimaryGeneratedColumn()
    cart_item_id!: number;

    @ManyToOne(() => Cart)
    cart!: Cart;

    @ManyToOne(() => Product)
    product!: Product;

    @Column()
    quantity!: number;
}
