console.log("krishna")
require('dotenv').config()
require("./config/db").connect();
const cors = require('cors');
const express = require('express')
const authRoutes = require("./routes/authRoutes");
const app = express()

const port = process.env.PORT || 4000

app.use(
    cors({
        credential: true,
        origin: '*'
    })
)

app.use(express.json())

app.use("/api/auth", authRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})