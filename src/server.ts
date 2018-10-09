import express from 'express';

const PORT = 3000;

const app = express();

app.static('..');

app.listen(PORT, () => console.log(`listening on port ${PORT}`))
