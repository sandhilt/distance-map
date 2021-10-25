import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Geolocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('double')
  latitute: number;

  @Column('double')
  longitude: number;
}
