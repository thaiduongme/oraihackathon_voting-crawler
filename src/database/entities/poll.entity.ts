import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Poll extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  contract_address: string;

  @Column()
  rejected_reason: string;

  @Column()
  passed: boolean;

  @Column()
  yes_votes: number;

  @Column()
  no_votes: number;

  @Column()
  tallied_weight: number;

  @Column()
  staked_weight: number;

  @Column()
  poll_quorum: number;

  @Column()
  quorum: number;
}
