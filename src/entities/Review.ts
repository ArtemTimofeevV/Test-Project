import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { User } from "./User";

@Entity()
export class Review {

    @PrimaryGeneratedColumn()
    review_id!: number;

    @ManyToOne(() => Product)
    product!: Product;

    @ManyToOne(() => User)
    user!: User;

    @Column("text")
    comment!: string;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;
}
