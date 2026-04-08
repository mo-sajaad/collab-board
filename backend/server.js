const express = require('express');
const app = express()

const authRoute = require('./routes/api/authRoutes')
const taskRoute = require('./routes/api/taskRoutes')

app.get('/', (req, res) => {
    res.send('hello root node')
})

app.use('/users', authRoute)
app.use('/tasks', taskRoute)

const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});