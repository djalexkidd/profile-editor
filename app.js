require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser')

// Configuration de l'Active Directory
const ActiveDirectory = require('activedirectory2');
const ad_config = { url: process.env.AD_SERVER,
               baseDN: process.env.AD_BASEDN,
               username: process.env.AD_USERNAME,
               password: process.env.AD_PASSWORD,
               attributes: {
                user: ['userPrincipalName', 'cn', 'telephoneNumber', 'otherTelephone', 'title', 'givenName', 'sn', 'department' ]
              } }
const ad = new ActiveDirectory(ad_config);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');
app.use(cookieParser());

// Page d'accueil
app.get("/", async (req, res) => {
    if (req.cookies.token !== undefined) {
        ad.findUser(req.cookies.token, function(err, user) {
            if (err) {
                console.log('ERROR: ' +JSON.stringify(err));
                return;
            }

            if (! user) console.log('User: ' + req.cookies.token + ' not found.');
            else res.render('index.ejs', {
                userfullname: user.cn,
                useremail: user.userPrincipalName,
                userdepartment: user.department,
                usertelephone: user.telephoneNumber,
                usermobile: user.otherTelephone,
                usertitle: user.title
            });
        })
    } else {
        res.redirect('/login');
    }
});

// Page d'authentification
app.get("/login", (req, res) => {
    res.render("login.ejs");
  });

// Page erreur 404
app.get('*', (req, res) => {
    res.render('404.ejs');
});

// Envoi du formulaire de connexion
app.post('/login', (req, res, next) => {
    const { userEmail, userPassword } = req.body; // Charge les données du formulaire
    ad.authenticate(userEmail, userPassword, function(err, auth) {
      if (err) {
          console.log('ERROR: '+JSON.stringify(err));
          res.redirect('/login');
          return;
      }
      if (auth) {
          res.cookie(`token`, userEmail);
          res.cookie(`token2`, userPassword);
          console.log(userEmail + " s'est connecté !");
          res.redirect('/');
      }
      else {
          console.log('Authentication failed!');
          res.redirect('/login');
      }
    });
});

// Envoi du formulaire d'édition
app.post('/', (req, res, next) => {
    const { userTel, userTelMobile, userTitle } = req.body; // Charge les données du formulaire
    res.redirect('/');
})

// Hébergement du serveur sur le port 3000
app.listen(3000, () => console.log("Server is running!"));