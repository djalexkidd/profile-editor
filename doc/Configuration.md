# Configuration du site web

Toutes les variables d'environnement se situent dans le fichier ```.env``` à la racine du projet, si le fichier n'existe pas vous pouvez le créer en vous basant sur le fichier d'exemple (```.env.example```).

Voici un exemple de configuration :

```
AD_SERVER=ldap://dc.domain.com  --- Adresse IP de l'Active Directory
AD_BASEDN=dc=domain,dc=com      --- Domaine racine
```