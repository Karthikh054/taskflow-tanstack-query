const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db.js");
const Todo = require("./models/Todo");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();



const PORT = 5000;

app.listen(PORT, ()=> {
    console.log("Server is runing");
});

app.use('/api/todos', todoRoutes);