const express = require("express")
const router = express.Router()

router.get('/login', (req, res) => {
    res.send('this is user route')
})

router.get('/signup', (req, res) => {
    res.send('this is user route')
})

module.exports = router;