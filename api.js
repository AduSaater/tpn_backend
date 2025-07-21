const client = require("./connection");
const express = require("express");
const app = express();
app.listen(3300, () => {
  console.log("server is running");
});
client.connect();

app.get("/users", (req, res) => {
  client.query(`Select * from users`, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
  client.end;
});
