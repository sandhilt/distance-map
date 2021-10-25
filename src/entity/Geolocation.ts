import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Geolocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  latitute: number;

  @Column('float')
  longitude: number;
}
