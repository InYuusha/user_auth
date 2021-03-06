const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')

//user model
const User = require('../models/User.js')

router.get('/login',(req,res)=>{
    res.render('login')

})


router.get('/register',(req,res)=>{
    res.render('register')
})

router.post('/register',(req,res)=>{
   const {name,email,password,password2}=req.body;
   let errors=[];
   //checking for required fileds
   if(!name||!email||!password||!password2){
       errors.push({msg:'Please fill in all the fields'})
   }
   //check for password match
   if(password!==password2){
       errors.push({msg:'Password do not match'})
   }
   // check for pass length
   if(password.length<6){
       errors.push({msg:'Password too short'})
   }
   if(errors.length >0)
   res.render('register',{
       errors,
       name,
       email
   })
   else{
      User.findOne({email:email})
      .then(user=>{
          if(user){
              errors.push({msg:'Email already exists'});
              res.render('register',{
                  errors,
                  name,
                  email
              })
          }
          else{
              const newUser = new User({
                  name:name,
                  email:email,
                  password:password
              })
              //hashing password
              bcrypt.genSalt(10,(err,salt)=>{
                  bcrypt.hash(newUser.password,salt,(err,hash)=>{
                      if(err) throw err;
                      //set password to hash
                      newUser.password=hash;
                      //save new User
                      newUser.save()
                      .then(user=>{
                          res.redirect('/users/login')
                      })
                      .catch(err=>console.log(err))
                  })
              })


          }
      })

   }
})
router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
    })
    (req,res,next);
})

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','You are logged out')
    res.redirect('/users/login')
})

module.exports = router;
