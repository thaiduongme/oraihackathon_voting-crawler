import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  PrimaryColumn,
} from "typeorm";

@Entity()
export class Block extends BaseEntity {
  @PrimaryColumn()
  public id: number;

  @Column()
  public block: number;
}
