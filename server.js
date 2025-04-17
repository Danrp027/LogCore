const express = require('express');
const path = require('path');
const sqlite = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const app = express();

const db = new sqlite.Database("LogCore.sqlite");
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, console.log("Rodando... http://localhost:3000"));

