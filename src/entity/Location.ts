import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Geolocation } from './Geolocation';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: false, unique: true })
  address_hash: string;

  @OneToOne(() => Geolocation)
  @JoinColumn()
  geolocation: Geolocation;
}
