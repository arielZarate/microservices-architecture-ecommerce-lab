import jwt from 'jsonwebtoken';

const secret= 'sapee2026';
const token=jwt.sign(
    {
        id:2,
        name:'Tupac Zarate',
        email:'tupac@test.com',
        role:"user"
    }
    ,
    secret,
    {
     algorithm:'HS512',
     expiresIn:'7d'
    }
);


console.log('**********Token generated***********') ;
console.log(token);
  
