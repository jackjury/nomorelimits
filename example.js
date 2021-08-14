const axios = require("axios");

const PROXY =
  process.env.NODE_ENV !== "production"
    ? ""
    : "https://nomorelimts.herokuapp.com/proxy?&url=";

let url = `${PROXY}https://thesimpsonsquoteapi.glitch.me/quotes`;

axios.get(url);
