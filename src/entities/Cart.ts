
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column } from "typeorm";
import { User } from "./User";

@Entity()
export class Cart {

    @PrimaryGeneratedColumn()
    cart_id!: number;

    @OneToOne(() => User)
    @JoinColumn()
    user!: User;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at!: Date;
}
