import {Column, Entity, OneToOne, PrimaryGeneratedColumn, Relation} from "typeorm";
import { PassportEntity } from "./PassportEntity.js";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    Id!: number;

    @Column()
    Name!: string;

    @Column()
    VkId!: number;

    @Column()
    SocialRating!: number;

    @Column()
    AccessLevel!: number;

    @Column({ default: "commands" })
    UseHandler!: string;

    @Column({ nullable: true, type: "text" })
    HandlerState?: string | null;

    @OneToOne(() => PassportEntity, r => r.User)
    Passport!: Relation<PassportEntity>;
}
