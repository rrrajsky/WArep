const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const firmRoutes = require('./routes/firmRoutes');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/api/firms', firmRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
