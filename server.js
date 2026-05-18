const express = require('express');

const app = express();

const db = require('./db');

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
