import express from "express";

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send('Hello world');
});

app.post('/addresses', (req, res) => {
  console.log(req.body);
  
  res.status(200).send({'Addresses': req.body});
})

app.listen(PORT, () => {
  console.log(`Server listen in http://localhost:${PORT}`);
});
