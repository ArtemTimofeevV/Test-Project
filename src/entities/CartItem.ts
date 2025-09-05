
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Cart } from "./Cart";
import { Product } from "./Product";

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
