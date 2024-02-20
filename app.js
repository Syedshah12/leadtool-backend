const express=require('express');
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken');
const {User} =require('./model/user')
const cookieParser = require('cookie-parser');
const app=express();
require('./db/connect.js')
require('dotenv').config()
const morgan=require('morgan');
const PORT=process.env.PORT || 5000;
const cors=require('cors');




//middlewares
app.use(cors());
app.options('*',cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());





//signUp
app.post('/register', async (req, res) => {
    try {
      // Check if email already exists:
  
      const existingUser = await User.findOne({ email: req.body.email });
  
      if (existingUser) {
        // Email already exists:
        return res.status(409).send({ message: 'Email already registered' });
      }
  
      // Email is unique, proceed with creating the user:
  
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
      });
  
      const savedUser = await user.save();
  
      if (!savedUser) {
        return res.status(500).send({ message: 'User creation failed' });
      }
  
      // User created successfully:
      res.status(201).send({ message: 'User created successfully', user: savedUser });
    } catch (error) {
      // Handle other errors:
      console.error(error);
      res.status(500).send({ message: 'Internal server error' });
    }
  });
    

    //get All Users   
app.get('/',async (req,res)=>{
    try {
        const user=await User.find().select('-passwordHash')
    if(!user){
        return res.status(400).send('user does not exist')
    }
    res.send(user);
    
    
    } catch (error) {
        
    }
    
    })
    


    //get User By Id
    app.get('/:id',async (req,res)=>{
        try {
            const user=await User.findById(req.params.id).select('-passwordHash')
        if(!user){
            return res.status(400).send('user does not exist')
        }
        res.send(user);
        
        
        } catch (error) {
            
        }
        
        })


        //login
        
// app.post('/login', async (req, res) => {
//     try {
//         const user = await User.findOne({ email: req.body.email });
//         if (!user) {
//             return res.status(404).send('User not found');
//         }


// if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
// const token=jwt.sign({
//     userId:user.id,
// },process.env.SECRET,{expiresIn:'2d'}

// )

// res.status(200).send({user:user.email,token:token})
// }else{
    
// return res.send('password not matched')
// }


//         // Additional login logic will be added here
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
            const token = jwt.sign({
                userId: user.id,
                userName:user.name,
                userEmail:user.email,
                isAdmin:user.isAdmin,
                paid:user.paid
            }, process.env.SECRET, { expiresIn: '2d' });

            // Set the token in a cookie
            // maxAge: This option specifies the maximum age of the cookie in milliseconds. In this case, it's set to 2 days. The calculation 2 * 24 * 60 * 60 * 1000 converts 2 days into milliseconds. 
            
// httpOnly: This option is set to true, which means the cookie is only accessible via HTTP requests and cannot be accessed or modified by client-side JavaScript
// Max age is in milliseconds


            // res.cookie('token', token, { maxAge: 2 * 24 * 60 * 60 * 1000, httpOnly: true });
             
            res.cookie('token', token, {
                maxAge: 1000 * 60 * 60 * 24, // Expires in 1 day
                httpOnly: true, // Secure: not accessible by client-side JavaScript
                secure: true, // Only sent over HTTPS
              });
            res.status(200).json({ user: user.email, token: token });
        } else {
            return res.send('Password not matched');
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`);
   
})


module.exports = app;