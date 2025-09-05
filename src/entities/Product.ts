
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Category } from "./Category";

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - sku
 *         - stock_quantity
 *       properties:
 *         product_id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *         price:
 *           type: number
 *           format: double
 *           description: The price of the product
 *         sku:
 *           type: string
 *           description: The SKU of the product
 *         stock_quantity:
 *           type: integer
 *           description: The stock quantity of the product
 *       example:
 *         name: Sample Product
 *         description: This is a sample product.
 *         price: 99.99
 *         sku: SP001
 *         stock_quantity: 100
 */
@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    product_id!: number;

    @Column()
    name!: string;

    @Column("text")
    description!: string;

    @Column("decimal")
    price!: number;

    @Column({ unique: true })
    sku!: string;

    @Column()
    stock_quantity!: number;

    @ManyToOne(() => Category)
    category!: Category;
}
