const   express     = require('express')
        app         = express(),
        iplurl      = require('./routes/matchRoutes')
        PORT        = process.env.PORT | 8082
        IP          = '127.0.0.1'

app.use('/api/', iplurl);

app.get('/', (req, res)=>{
    res.redirect('/api/');
});

app.listen(PORT, IP, _=>{
    console.log(`Server is running on http://${IP}:${PORT}`)
});