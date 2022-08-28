require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser')
const https = require("https");
const fs = require("fs");

// Configuration de l'Active Directory pour la modification
const ldap = require('ldapjs');
const assert = require('assert');

const client = ldap.createClient({
  url: process.env.AD_SERVER,
  reconnect: true
});

client.on('error', (err) => {
  console.log(err)
})

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');
app.use(cookieParser());

// Configuration de l'Active Directory pour la lecture
function getAdUser(req) {
    const ActiveDirectory = require('activedirectory2');
    const ad_config = { url: process.env.AD_SERVER,
           baseDN: process.env.AD_BASEDN,
           username: req.cookies.token,
           password: req.cookies.token2,
           attributes: {
            user: ['userPrincipalName', 'cn', 'telephoneNumber', 'mobile', 'title', 'givenName', 'department', 'ipPhone', 'distinguishedName']
          } }
    const ad = new ActiveDirectory(ad_config);

    return ad
}

// Page d'accueil
app.get("/", async (req, res) => {
    if (req.cookies.token !== undefined) {
        getAdUser(req).findUser(req.cookies.token, function(err, user) {
            const userWhitelist = user.distinguishedName
            if (err) {
                console.log('ERROR: ' +JSON.stringify(err));
                return;
            }

            if (! user) console.log('User: ' + req.cookies.token + ' not found.');
            // Piège à la con, déconnecte si l'utilisateur n'est pas dans l'OU
            else if (process.env.OU_TRAP === "true" && !userWhitelist.includes(process.env.OU_TRAP_WHITELIST)) {
                res.redirect('/logout');
                return;
            }
            else res.cookie(`token3`, user.cn); res.render('index.ejs', {
                userfullname: user.cn,
                useremail: user.userPrincipalName,
                userdepartment: user.department,
                usertelephone: user.telephoneNumber,
                usermobile: user.mobile,
                usertitle: user.title,
                userabr: user.ipPhone
            });
        })
    } else {
        res.redirect('/login');
    }
});

// Page d'authentification
app.get("/login", (req, res) => {
    res.render("login.ejs", {
        error: ""
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.clearCookie("token2");
    res.clearCookie("token3");
    res.redirect('/login');
});

// Page quand le profil est modifié avec succès
app.get("/success", (req, res) => {
    res.render("success.ejs");
});

// Page erreur 404
app.get('*', (req, res) => {
    res.render('404.ejs');
});

// Envoi du formulaire de connexion
app.post('/login', (req, res, next) => {
    const { userEmail, userPassword } = req.body; // Charge les données du formulaire
    getAdUser(req).authenticate(userEmail + "@" + process.env.DOMAIN_NAME, userPassword, function(err, auth) {
      if (err) {
          console.log('ERROR: '+JSON.stringify(err));
          res.render("login.ejs", {
            error: "Nom d'utilisateur ou mot de passe incorrect."
          });
          return;
      }
      if (auth) {
          res.cookie(`token`, userEmail + "@" + process.env.DOMAIN_NAME);
          res.cookie(`token2`, userPassword);
          console.log(userEmail + " s'est connecté !");
          res.redirect('/');
      }
      else {
          console.log('Authentication failed!');
          res.render("login.ejs", {
            error: "Nom d'utilisateur ou mot de passe incorrect."
          });
      }
    });
});

function checkPrefix(userTel) {
    if (userTel.includes("+33 (0)")) {
        return ""
    }
    else {
        return "+33 (0)"
    }
}

function deletePrefix(userTel) {
    if (userTel.includes("+33 (0)")) {
        return userTel.slice(7)
    }
    else {
        return userTel
    }
}

// Envoi du formulaire d'édition
app.post('/', (req, res, next) => {
    client.bind(req.cookies.token, req.cookies.token2, (err) => {
        assert.ifError(err);
    });

    const { userTel, userTelMobile, userAbr, userTitle, auto1, auto2 } = req.body; // Charge les données du formulaire

    const changeOne = new ldap.Change({
        operation: 'replace',
        modification: {
            telephoneNumber: (auto1 ? checkPrefix(userTel) + userTel : deletePrefix(userTel))
        }
    });

    const changeTwo = new ldap.Change({
        operation: 'replace',
        modification: {
            mobile: (auto2 ? checkPrefix(userTelMobile) + userTelMobile : deletePrefix(userTelMobile))
        }
    });

    const changeThree = new ldap.Change({
        operation: 'replace',
        modification: {
            title: userTitle
        }
    });

    const changeFour = new ldap.Change({
        operation: 'replace',
        modification: {
            ipPhone: userAbr
        }
    });

    getAdUser(req).findUser(req.cookies.token, function(err, user) {
        if (err) {
            console.log('ERROR: ' +JSON.stringify(err));
            return;
        }

        if (! user) console.log('User: ' + req.cookies.token + ' not found.');
        else {
            if (user.cn !== req.cookies.token3) {
                return;
            } else {
                client.modify(user.distinguishedName, changeOne, (err) => {
                    assert.ifError(err);
                });
                    
                client.modify(user.distinguishedName, changeTwo, (err) => {
                    assert.ifError(err);
                });
                    
                client.modify(user.distinguishedName, changeThree, (err) => {
                    assert.ifError(err);
                });

                client.modify(user.distinguishedName, changeFour, (err) => {
                    assert.ifError(err);
                });
            }
        }
    });
    
    res.redirect('/success');
});

// Hébergement du serveur
if (process.env.SSL === "true") { // Si SSL est activé dans les envvars le site utilisera HTTPS
    https.createServer({
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT),
      },app).listen(process.env.PORT, ()=>{
        console.log("Server is running! HTTPS PORT " + process.env.PORT)
    });
} else { // Sinon utiliser HTTP
    app.listen(process.env.PORT, () => console.log("Server is running! HTTP PORT " + process.env.PORT));
}