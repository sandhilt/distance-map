import express from "express";
import { Client } from "@googlemaps/google-maps-services-js";
import * as dotenv from "dotenv";

dotenv.config();
const app = express();
const googleMapsClient = new Client({});

const PORT = parseInt(process.env.PORT ?? '8000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello world");
});

async function getLocationFromAddress(address: string) {
  const geocode = await googleMapsClient.geocode({
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_GEOCODE_KEY as string,
    },
  });

  return geocode;
}

app.post("/addresses", async (req, res) => {
  console.log(req.body);

  const [firstAddress] = req.body;

  try {
    const firstLocation = await getLocationFromAddress(firstAddress);

    console.log({ location: firstLocation, address: firstAddress });
    res.status(200).send({ Addresses: req.body });
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
