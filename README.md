# API_Justify

Afin de pouvoir utiliser cette API, il est nécessaire d’avoir:
- MongoDB
- D’utiliser un logiciel tel que POSTMAN

Une fois le project clonné, avec POSTMAN allez sur l’URL suivante :

`GET localhost:3000/setup`

Cela permet de creer un utilisateur pour le test de l’API

dans la DB a la collection users, vous devriez trouver une entree :

```
_id: ObjectId("5b38fd2aa5647869cc7b850e")
email:"nicolas.havard@epitech.eu"
__v:0
``` 

Allez ensuite sur l'URL :
`POST localhost:3000/api/token`

Dans la partie "Body", cochez le format "x-www-form-urlencoded", puis renseignez la key:value :
`email : nicolas.havard@epitech.eu`

Appuyez sur SEND.

Si l'utilisateur est bien existant POSTMAN vous retourne une reponse en JSON avec un token.
```json
{
    "success": true,
    "message": "Voici le token",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMuaGF2YXJkQGVwaXRlY2guZXUiLCJpYXQiOjE1MzA0NjI1MTUsImV4cCI6MTUzMDU0ODkxNX0.OzET3e8PTzInLSVnmcHv0FlMGPEGU7M5YzzX_5LV0jo"
}
```

Gardez le token a portee de main.

Allez ensuite a l'URL :
`POST localhost:3000/api/justify`

Dans la partie "Headers", ajouter la key:value
`x-access-token : token precedement recu`

puis dans la partie "Body", cochez "raw", puis passez en "text(text/plain)"
entrez n'importe quel texte dans le champ de text.

Appuyez sur SEND.


Restriction du sujet:
- La longueur des lignes du texte justifié doit être de 80 caractères.
- L’endpoint doit être de la forme /api/justify et doit retourner un texte justifié suite à une requête POST avec un body de ContentType text/plain.
- L’api doit utiliser un mécanisme d’authentification via token unique. En utilisant par exemple une endpoint api/token qui retourne un token d’une requête POST avec un json body {"email": "foo@bar.com"}.
- Il doit y avoir un rate limit par token pour l’endpoint /api/justify, fixé à 80 000 mots par jour, si il y en a plus dans la journée il faut alors renvoyer une erreur 402 Payment Required.
- Le code doit être déployé sur un url ou une ip public
- Le code doit être rendu sur github

