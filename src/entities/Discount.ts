
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Discount {

    @PrimaryGeneratedColumn()
    discount_id!: number;

    @Column({ unique: true })
    code!: string;

    @Column("text")
    description!: string;

    @Column()
    discount_type!: string;

    @Column("decimal")
    value!: number;

    @Column({ type: 'timestamp' })
    end_date!: Date;
}
