const   mongoose    = require('mongoose');
        express     = require('express');
        router      = express.Router();
        dbMethod    = require('../db_connection/connection')

router.get('/year/:year', (req, res)=>{
    dbMethod.getYear(req.params.year).then(teams=>{
        res.status(200).send(teams)
    });
});

router.get('/', (req, res)=>{
    dbMethod.getSeasons().then(season=>{
        res.status(200).send(season)
    })    
})


// router.get('/:year/:teamname', (req, res)=>{
//     console.log('year', req.params.year)
//     dbMethod.getTeam(req.params.year, req.params.teamname).then(teams=>{
//         console.log(x)
//         res.status(200).send('asdf')
//     })    
// })

module.exports = router;