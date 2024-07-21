import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class ParameterEntity {
    @PrimaryColumn()
    key!: string;

    @Column()
    value!: string;
}