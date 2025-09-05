
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { User } from "./User";

@Entity()
export class Rating {

    @PrimaryGeneratedColumn()
    rating_id!: number;

    @ManyToOne(() => Product)
    product!: Product;

    @ManyToOne(() => User)
    user!: User;

    @Column()
    rating_value!: number;
}
