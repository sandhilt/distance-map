import express from 'express';
import { Client } from '@googlemaps/google-maps-services-js';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getRepository } from 'typeorm';
import { Location } from './entity/Location';
import { generateHash } from './utils/generateHash';
import { Geolocation } from './entity/Geolocation';
import Joi, { func } from 'joi';

dotenv.config();
createConnection();

const app = express();
const googleMapsClient = new Client({});

const PORT = parseInt(process.env.PORT ?? '8000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello world');
});

async function getLocationFromAddress(address: string) {
  const geocode = await googleMapsClient.geocode({
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_GEOCODE_KEY as string,
    },
  });

  const location = geocode.data.results[0].geometry.location;

  return location;
}

function distEuclid(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function allDistEuclid(geolocations: Geolocation[]): number[] {
  const distances: number[] = [];
  for (let i = 0; i < geolocations.length; i++) {
    for (let j = i + 1; j < geolocations.length; j++) {
      const dist = distEuclid(
        geolocations[i].latitute,
        geolocations[i].longitude,
      );
      distances.push(dist);
    }
  }
  return distances;
}

const AddressSchema = Joi.array().min(2).items(Joi.string().required());

app.post('/addresses', async (req, res) => {
  const allAddresses: string[] = req.body;

  AddressSchema.validate(allAddresses, {
    abortEarly: false,
  });

  const locationRepository = getRepository(Location);
  const geoLocationRepository = getRepository(Geolocation);

  try {
    const geolocationAddresses = await Promise.all(
      allAddresses.map(async (address) => {
        const addressHash = generateHash(address);

        const [locationInDatabase] = await locationRepository.find({
          where: { address_hash: addressHash },
          relations: ['geolocation'],
        });

        if (locationInDatabase) {
          return locationInDatabase.geolocation;
        }

        const geolocationAddress = await getLocationFromAddress(address);

        const geolocation = new Geolocation();
        geolocation.latitute = geolocationAddress.lat;
        geolocation.longitude = geolocationAddress.lng;
        await geoLocationRepository.save(geolocation);

        const newLocation = new Location();
        newLocation.address_hash = addressHash;
        newLocation.geolocation = geolocation;
        await locationRepository.save(newLocation);

        return geolocation;
      }),
    );

    console.log(geolocationAddresses);
    res.status(200).send(geolocationAddresses);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }

    return res.status(400).send({ error: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server listen in http://localhost:${PORT}`);
});
