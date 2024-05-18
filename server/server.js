import express, { response } from 'express';
import mysql from 'mysql';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const salt = 10;

const app = express ();
app.use (express.json());
app.use (cors());
app.use (cookieParser());


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "signup"
});


app.post('/register', (req, res) => {
    const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
      if(err) return res.json({Error: "Error for hashing password"});
      const values = [
        req.body.name,
        req.body.email,
        hash
      ];
      db.query(sql, [values], (err, result) => {
        if(err) return res.json({Error: "Inserting data Error in server"});
        return res.json({Status: "Success"});
      })
    })
  })
  

  app.post('/login' , (req, res) => {
    const sql = 'SELECT * FROM login WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) => { 
     if(err ) return res.json({Error: "Login error in server"});
     if(data.length > 0) {
        bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
         if(err) return res.json({Error: "Password compare error"});
         if(response) {
           return res.json({Status: "Success"});
         } else {
         return res.json({Error: "Password no matched"});
         }
        })
     }else {
       return res.json({Error:"No email axisted"});
     }
    })
 })
 

app.listen (8081 ,() => {
    console.log("Running. ..");
})