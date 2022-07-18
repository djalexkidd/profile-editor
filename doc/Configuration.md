# Configuration du site web

Toutes les variables d'environnement se situent dans le fichier ```.env``` à la racine du projet, si le fichier n'existe pas vous pouvez le créer en vous basant sur le fichier d'exemple (```.env.example```).

Voici un exemple de configuration :

```
PORT=3000                           --- Port d'écoute
AD_SERVER=ldap://dc.domain.com      --- Adresse IP de l'Active Directory
AD_BASEDN=dc=domain,dc=com          --- Domaine racine
SSL=true                            --- Utiliser HTTPS
SSL_KEY=/usr/local/ssl/key.pem      --- Chemin de la clé
SSL_CERT=/usr/local/ssl/cert.pem    --- Chemin du certificat
```