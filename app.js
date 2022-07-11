require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser')

// Configuration de l'Active Directory
const ActiveDirectory = require('activedirectory2');
const ad_config = { url: process.env.AD_SERVER,
               baseDN: process.env.AD_BASEDN,
               username: process.env.AD_USERNAME,
               password: process.env.AD_PASSWORD }
const ad = new ActiveDirectory(ad_config);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

// Page d'accueil
app.get("/", async (req, res) => {
    res.render('index.ejs');
});

// Page erreur 404
app.get('*', (req, res) => {
    res.render('404.ejs');
});

// Hébergement du serveur sur le port 3000
app.listen(3000, () => console.log("Server is running!"));