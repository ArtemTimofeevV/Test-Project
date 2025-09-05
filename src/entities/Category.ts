
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Category {

    @PrimaryGeneratedColumn()
    category_id!: number;

    @ManyToOne(() => Category, category => category.childCategories, { nullable: true })
    parentCategory!: Category;

    @OneToMany(() => Category, category => category.parentCategory)
    childCategories!: Category[];

    @Column()
    name!: string;
}
