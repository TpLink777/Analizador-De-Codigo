const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); // sirve para limitar la cantidad de peticiones que un usuario puede hacer en un tiempo determinado
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' })); // sirve para poder recibir datos en formato json
app.use(cors(
    {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173'
    }
));

const huggingfaceRoutes = require('./routes/huggingface.routes');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo de 10 peticiones
    message: { error: 'Demasiados análisis, intenta en 15 minutos' }
});

app.use('/api/huggingface', limiter, huggingfaceRoutes);


app.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


module.exports = app;





