import jwt from 'jsonwebtoken';

const secret= 'sapee2026';
const token=jwt.sign(
    {
        id:1,
        name:'Ariel Zarate',
        email:'ariel@test.com',
        role:"admin"
    }
    ,
    secret,
    {
     algorithm:'HS512',
     expiresIn:'24h'
    }
);


console.log('**********Token generated***********') ;
console.log(token);
  
