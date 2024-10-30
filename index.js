import express from "express";
import pg from "pg";
import methodOverride from "method-override";

const app = express();
const port = process.env.PORT;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "notes",
    password: "Ankit@241105"
});
db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));



app.get("/notes", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM notes ORDER BY created_at DESC");
        // console.log("Full result:", result);
        // console.log("Rows:", result.rows);
        res.render("notes", { notes: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


app.post("/notes", async (req, res) => {
    const { title, content } = req.body;
    // console.log("title: ", title);
    // console.log("content: ", content);
    try {
        const query = "INSERT INTO notes (title, content, created_at) VALUES ($1, $2, NOW()) RETURNING *";
        const values = [title, content];
        await db.query(query, values);
        res.redirect("/notes");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


app.delete("/notes/:id", async (req, res) => {
    // const { id } = req.params;
    const id = req.params.id;
    // console.log("id: ", id);
    try {
        const query = "DELETE FROM notes WHERE id = $1";
        await db.query(query, [id]);
        res.redirect("/notes");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.put("/notes/:id", async (req, res) => {
    const id = req.params.id;
    // const { title, content } = req.body;
    const title = req.body.title;
    const content = req.body.content;

    console.log("Updating note with ID:", id);

    try {
        const query = "UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *";
        const values = [title, content, id];
        await db.query(query, values);
        res.redirect("/notes");

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

//returning
//handlebars
//piyush garg & vinod thapa
//use of delete and put with overrider




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

