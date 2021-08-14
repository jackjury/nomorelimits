const express = require("express");
const app = express();
const axios = require("axios");
app.use(express.json());
const cors = require("cors");
app.use(cors());

let cache = null;

app.post("/getApiData", async (request, response) => {
  //check if we saved the result from the api
  if (cache) {
    console.log("Sending cached data");
    response.send({ result: cache.data }); //if so send cache
  } else {
    console.log("Getting new data from API");
    const apiKey = "cd02649997e97766b1cc67fa61c60870";
    const apiUrl = "http://data.fixer.io/api/latest";

    const result = await axios.get(
      `${apiUrl}?access_key=${apiKey}&symbols=USD,AUD,CAD,PLN,MXN`
    );

    cache = result;
    response.send({ result: result.data }); //get data from api then save
  }
});

app.listen(6001, () => {
  console.log("Back end is alive!");
});
