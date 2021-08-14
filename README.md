# nomorelimitsnopm

##

To use simply pre-pend your `GET` request with:

```
https://nomorelimts.herokuapp.com/proxy?NML_TTL=5000&url=
```

Example:

```
const axios = require("axios");

const PROXY =
  process.env.NODE_ENV !== "production"
    ? ""
    : "https://nomorelimts.herokuapp.com/proxy?&url=";

let url = `${PROXY}https://thesimpsonsquoteapi.glitch.me/quotes`;

axios.get(url);
```

## To Dos:

- [ ] Handle Errors
- [ ] Pass on the headers?

## Backburner

- [ ] Add other methods
