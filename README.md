# Distance Map

## Steps to reproduce:

1. Clone this repo.
2. Install Docker and Docker Compose.
3. Create an key following this steps in: https://developers.google.com/maps/premium/apikey/geocoding-apikey?hl=pt-br
4. After generate an key, copy file `.env.example` to `.env`.
5. Change the value of `GOOGLE_MAPS_API_GEOCODE_KEY` by generate key.
6. Run:

```bash
   $ docker-compose up -d
```

7. Call a route to `POST /addresses` or `import Insomnia_distance_map.json` in root to Insomnia. This is a example of route:

`POST http://localhost:3334/addresses`

```json
{
  "addresses": [
    "Av. Rio Branco, 1 Centro, Rio de Janeiro RJ, 20090003; Praça Mal. Âncora, 122 Centro, Rio de Janeiro RJ, 20021200",
    "Rua 19 de Fevereiro, 34 ​ Botafogo, Rio de Janeiro ​ RJ, 22280​030",
    "Av. das Américas, 500 - bloco 9, sala 301 - Barra da Tijuca, Rio de Janeiro - RJ, 22640-100",
    "R. São Francisco Xavier, 524 - Maracanã, Rio de Janeiro - RJ, 20550-013"
  ]
}
```
