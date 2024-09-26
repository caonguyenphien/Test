//Import
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

//Import các thư viện tên biến
const app =express();
const PORT = process.env.PORT||3000;

// Thêm module path Đường dẫn trỏ về file css
const path = require('path'); 

// app.get("/",(req,res)=>{res.send('Hello Ngoc');});
app.listen(PORT,()=>{console.log(`server stared at http://localhost:${PORT}`);});

//Connect database
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("Connected to the database!"));

//Middleware (phần mềm trung gian)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    session({
        secret: "baongoc",
        saveUninitialized: true,
        resave: false,
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

//Add engine template
app.set('view engine', 'ejs');

//Trỏ vào để nhúng thư mục fontend 
app.use(express.static(path.join(__dirname, 'views', 'layout', 'assets')));

// Trỏ file upload
app.use(express.static("upload"));

// Nhúng routes vào
app.use("", require("./routes/routes"));