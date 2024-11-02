import express from "express";
import pg from "pg";
import methodOverride from "method-override";
import bcrypt from "bcrypt";
import { jwtAuthMiddleware, generateToken } from './jwt.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "notes",
    password: "Ankit@241105"
});
db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(cookieParser());


app.get("/signup", async (req, res) => {
    try {
        res.render("signup");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error(signup-get)");
    }
});

app.post("/signup", async (req, res) => {
    const { name, password } = req.body;
    console.log("Received data:", req.body);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (name, password) VALUES ($1, $2) RETURNING uid";
        const values = [name, hashedPassword];
        const result = await db.query(query, values);
        const uid = result.rows[0].uid;
        const token = generateToken({ uid });
        console.log("Token is : ", token);
        res.cookie('token', token, {
            maxAge: 5 * 60 * 1000
        });

        const tableName = `user_${uid}`;
        const createTableQuery = `
            CREATE TABLE ${tableName} (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255),
                content TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `;
        await db.query(createTableQuery);
        res.redirect("./notes");
    } catch (err) {
        if (err.code === '23505') {  //unique violation code
            res.status(400).json({ error: "Username already exists" });
        } else {
            console.error(err);
            res.status(500).send("Server Error(signup-post)");
        }
    }
});





app.get("/login", async (req, res) => {
    try {
        res.render("login");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error(login-get)");
    }
});

app.post("/login", async (req, res) => {
    const { name, password } = req.body;

    try {
        const query = "SELECT * FROM users WHERE name = $1";
        const result = await db.query(query, [name]);

        if (result.rows.length === 0) {
            return res.status(400).send("User not found");
        }
        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Incorrect password");
        }
        const token = generateToken({ uid: user.uid });
        console.log("Token is : ", token);
        res.cookie('token', token, {
            maxAge: 5 * 60 * 1000
        });

        res.redirect("./notes");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error(login-post)");
    }
});




//CRUD
app.get("/notes",jwtAuthMiddleware, async (req, res) => {
    const tableName = `user_${req.user.uid}`;
    try {
        const result = await db.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
        // console.log("Full result:", result);
        // console.log("Rows:", result.rows);
        res.render("notes", { notes: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error get");
    }
});


app.post("/notes",jwtAuthMiddleware, async (req, res) => {
    const { title, content } = req.body;
    console.log(req.user.uid);
    const tableName = `user_${req.user.uid}`;
    // console.log("title: ", title);
    // console.log("content: ", content);
    try {
        const query = `INSERT INTO ${tableName} (title, content, created_at) VALUES ($1, $2, NOW()) RETURNING *`;
        const values = [title, content];
        await db.query(query, values);
        res.redirect("/notes");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error post");
    }
});


app.delete("/notes/:id",jwtAuthMiddleware, async (req, res) => {
    const id = req.params.id;
    // console.log("id: ", id);
    const tableName = `user_${req.user.uid}`;
    try {
        const query = `DELETE FROM ${tableName} WHERE id = $1`;
        await db.query(query, [id]);
        res.redirect("/notes");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error delete");
    }
});

app.put("/notes/:id",jwtAuthMiddleware, async (req, res) => {
    const id = req.params.id;
    // const { title, content } = req.body;
    const title = req.body.title;
    const content = req.body.content;
    const tableName = `user_${req.user.uid}`;

    console.log("Updating note with ID:", id);

    try {
        const query = `UPDATE ${tableName} SET title = $1, content = $2 WHERE id = $3 RETURNING *`;
        const values = [title, content, id];
        await db.query(query, values);
        res.redirect("/notes");

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error put");
    }
});

//returning
//handlebars
//piyush garg & vinod thapa
//use of delete and put with overrider




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

