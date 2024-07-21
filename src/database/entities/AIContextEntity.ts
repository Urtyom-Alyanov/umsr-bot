import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class AIContextEntity {
    @PrimaryGeneratedColumn()
    Id!: number;

    @Column()
    Text!: string;
}