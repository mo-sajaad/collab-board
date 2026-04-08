const express = require("express")
const router = express.Router()

router.get('/', (req, res) => {
    res.send('this is user route')
})

router.get('/101', (req, res) => {
    res.send('this is user 101 route')
})

router.get('/102', (req, res) => {
    res.send('this is user 102 route')
})

module.exports = router;