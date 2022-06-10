import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Poll extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  creator: string;

  @Column()
  status: string;

  @Column()
  quorumPercentage: number;

  @Column()
  startHeight: number;

  @Column()
  endHeight: number;

  @Column()
  title: string;

  @Column()
  description: string;
}
