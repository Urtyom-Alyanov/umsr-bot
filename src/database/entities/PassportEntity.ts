import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { UserEntity } from "./UserEntity.js";

@Entity()
export class PassportEntity {
    @PrimaryGeneratedColumn("uuid")
    Id!: string;

    @Column()
    Name!: string;

    @Column()
    SurName!: string;

    @Column()
    PatronymicName!: string;

    @Column()
    Date!: string;

    @Column()
    Gender!: string;

    @Column()
    Republic!: string;

    @Column()
    City!: string;

    @Column()
    Nation!: string;

    @Column("text", {
        transformer: {
            from(value: string | string[] = ""): string[] {
                if (typeof value === "object" && "forEach" in value) return value;
                return value.split(",");
            },
            to(value: string[] = []): string {
                return value.join(",");
            }
        },
        default: ""
    })
    Stamps!: string[];

    @Column()
    Photo!: Buffer;

    @Column()
    UserId!: number;

    @OneToOne(() => UserEntity, r => r.Passport)
    @JoinColumn({ name: "UserId" })
    User!: Relation<UserEntity>;
}