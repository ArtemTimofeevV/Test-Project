
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Address {

    @PrimaryGeneratedColumn()
    address_id!: number;

    @ManyToOne(() => User)
    user!: User;

    @Column()
    address_line1!: string;

    @Column()
    city!: string;

    @Column()
    postal_code!: string;

    @Column()
    country!: string;
}
