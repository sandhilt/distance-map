import express from 'express';
import { Client } from '@googlemaps/google-maps-services-js';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getRepository } from 'typeorm';
import { Location } from './entity/Location';
import { distEuclidFromGeolocation, generateHash, roundNumber } from './utils';
import { Geolocation } from './entity/Geolocation';
import Joi from 'joi';
import { AddressRequest, Distance } from './typings';

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

  const locationFixed: typeof location = {
    lat: roundNumber(location.lat),
    lng: roundNumber(location.lng),
  };

  return locationFixed;
}

function allDistEuclid(locations: Location[]): Distance[] {
  const distances: Distance[] = [];

  for (let i = 0, k = locations.length; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const distanceNumber = distEuclidFromGeolocation(
        locations[i].geolocation,
        locations[j].geolocation,
      );

      const distance: Distance = {
        address_1: locations[i].address_name,
        address_2: locations[j].address_name,
        value: roundNumber(distanceNumber),
      };
      distances.push(distance);
    }
  }

  distances.sort((a, b) => a.value - b.value);

  return distances;

  // const distances: GeolocationDistance[][] = [];

  //   const arr: GeolocationDistance[] = [];

  //     const dist = distEuclid(
  //       geolocations[i].latitute,
  //       geolocations[i].longitude,
  //     );
  //     const distRounded = roundNumber(dist);
  //     const geolocationDistance: GeolocationDistance = {
  //       direction: `${geolocations[i].id} to ${geolocations[j].id}`,
  //       distance: distRounded,
  //     };
  //     arr.push(geolocationDistance);
  //   }
  //   distances.push(arr);
  // }
  // return distances;
}

const AddressSchema = Joi.object({
  address: Joi.array().min(2).items(Joi.string().required()),
});

app.post('/addresses', async (req, res) => {
  const requestAddresses: AddressRequest = req.body;

  AddressSchema.validate(requestAddresses, {
    abortEarly: false,
  });

  const locationRepository = getRepository(Location);
  const geoLocationRepository = getRepository(Geolocation);

  try {
    const locationAddresses: Location[] = await Promise.all(
      requestAddresses.addresses.map(async (addressName) => {
        const addressHash = generateHash(addressName);

        const locationInDatabase = await locationRepository.findOne({
          where: { address_hash: addressHash },
          relations: ['geolocation'],
        });

        if (locationInDatabase) {
          return locationInDatabase;
        }

        /**
         * Create new location to database
         */

        const geolocationAddress = await getLocationFromAddress(addressName);

        const geolocation = new Geolocation();
        geolocation.latitute = geolocationAddress.lat;
        geolocation.longitude = geolocationAddress.lng;
        await geoLocationRepository.save(geolocation);

        const newLocation = new Location();
        newLocation.address_name = addressName;
        newLocation.address_hash = addressHash;
        newLocation.geolocation = geolocation;
        await locationRepository.save(newLocation);

        return newLocation;
      }),
    );

    const distances = allDistEuclid(locationAddresses);

    console.log({ distances });
    res.status(200).send({ distances });
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
