//LAST UPDATE: 1st phase done and finished 
//Next steps: user edit, plate number modification, table for registered users and their qr code
//            admin manipulating register (db for quantity and prices) and can edit rally register inputs
//            payment method and prices.

//NPMs
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import flash from "connect-flash";
import insertRegister, {checkRegister} from "./models/checkRegister.js";

//Model FUnctions
import GenerateQR from "./models/qr-generate.js";
import Hash from "./models/hashFunc.js";
import UpdateRally from "./models/updateRally.js";

const port = process.env.PORT || 3001; //Temporary port for localhost
const app = express();
const admin = 'admin';
const adminPass = 'admin';
var isAdminAuth = false;
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

//Initializing passport for cookies
app.use(
    session({
      secret: "TOPSECRETWORD",
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,  // 24 hours in milliseconds
      }
    })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//End of passport initialization

//Connecting to data base
const db = new pg.Client({
    user: 'postgres.sefthmfdkdzeosmxzdev',
    host: "aws-0-us-west-1.pooler.supabase.com",
    database: "postgres",
    password: "Amiralibavafa1382*",
    port: 6543,
});

db.connect();

//End of connecting to the database

//Home page render
app.get('/', (req,res)=>{
    res.render('home.ejs');
});

//Admin Login page render
app.get('/admin', (req,res)=>{
    res.render('admin_login.ejs', {passwordIncorrect : false});
});

app.get('/admin/home', (req,res)=>{
    if (isAdminAuth){
        res.render('admin_page.ejs');
    }

    else{
        res.redirect('/admin');
    }
});

app.post('/admin-login', (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    if (username == admin && password == adminPass){
        isAdminAuth = true;
        res.redirect('/admin/home');
    }

    else{
        isAdminAuth = false;
        res.render('admin_login.ejs', {passwordIncorrect: true});
    }

});

app.get('/admin/get/users-table', async(req,res)=>{ // generating table page for users to be seen by admin and their qr code
    const dbreq = await db.query('SELECT * FROM users');
    const countResult = await db.query('SELECT COUNT(*) FROM users');
    const count = parseInt(countResult.rows[0].count, 10);
    const users = (await dbreq).rows;
    if (isAdminAuth){
        res.render('users_table.ejs', {users, count, isDeleted : false});
    }

    else{
        res.redirect('/admin');
    }
});

app.get('/admin/:username/qr-image', (req,res)=>{ // generate different page for qrcode of the desired user
    const username = req.params.username;

    if (isAdminAuth){
        res.render('qr_image.ejs', {username});
    }

    else{
        res.redirect('/admin');
    }
});

app.get('/admin/get/rally1-result', async(req,res)=>{ // presenting rally data table to admin only
    if (isAdminAuth){
        const dbreq = await db.query('SELECT * FROM rally');
        const countResult = await db.query('SELECT COUNT(*) FROM rally');
        const count = parseInt(countResult.rows[0].count, 10);
        const rally = (await dbreq).rows;

        res.render('rally_table.ejs', {rally, count});
    }

    else{
        res.redirect('/admin');
    }
});

//Deleting user when requested by admin
app.get('/admin/delete-user/:username', async(req, res)=>{
    if (isAdminAuth){
        const username = req.params.username;
        const query = "DELETE FROM users WHERE username= $1";
        await db.query(query, [username]);

        res.redirect('/admin/get/users-table');
    }

    else {
        res.redirect('/admin');
    }
});

//clearing rally table
app.get('/admin/rally/clear-table', async(req,res)=>{
    if (isAdminAuth){
        await db.query("DELETE FROM rally");
        res.redirect('/admin/get/rally1-result');
    }

    else{
        res.redirect('/admin');
    }
});

//Login page render
app.get('/login', (req,res)=>{
    if (req.isAuthenticated()){
        res.redirect('/user/home');
    }

    else{
        res.render('user_login.ejs', {passwordErr: req.flash('error')});
    }

});

//logging in user
app.post('/user-login', passport.authenticate("local", {
    successRedirect: "/user/home",
    failureRedirect: "/login",
    failureFlash: true,
}));

//logout
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.redirect('/user/home');  // If there is an error logging out, stay on the user page
        }
        res.redirect('/login');  // Redirect to login page after logging out
    });
});

//User page after login                                             //Temp needs to add cookies
app.get('/user/home', (req,res)=>{
    if (req.isAuthenticated()){
        const { firstname, lastname, username } = req.user;
        res.render('user_page.ejs', {firstname, lastname, username});
    }
    else {
        res.redirect('/login');
    }
});

app.get('/rally/sign-up', (req,res)=>{
    if (req.isAuthenticated){
        const { firstname, lastname, username } = req.user;
        res.render('user-contest-signup.ejs', {firstname, lastname, username});
    }

    else{
        res.redirect('/login');
    }
});

app.post('/rally/sign-up/:username', async(req,res)=>{
    const username = req.params.username;
    if (req.isAuthenticated){
        const isRegister =  await checkRegister(username);
        if (isRegister){
            res.redirect('/rally/sign-up');
        }

        else{
            const cars = req.body.cars;
            const room = req.body.room;
            const plate1 = req.body.plate1;
            const platechar = req.body.platechar;
            const plate2 = req.body.plate2;
            const plate3 = req.body.plate3;
            const plate = plate1+platechar+plate2+plate3;
            await insertRegister(cars, plate, room, username);
            const { firstname, lastname } = req.user;
            res.render('user-contest-signup.ejs', {firstname, lastname, username});
        }
    }
    else{
        res.redirect('/login');
    }
});



//login cookies session and authentication
passport.use(
    new Strategy(async function verify(username, password, cb) {
      try {
        const result = await db.query("SELECT * FROM users WHERE username = $1 ", [
          username,
        ]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.hash;
          const hashed = Hash(password);

          if (hashed == storedHashedPassword){
            return cb(null, user);
          }

          else{
            return cb(null, false, { message: 'Password Incorrect' });
          }

        } 
        else {
            return cb(null, false, { message: 'User not found' }); // User not found
        }
      } catch (err) {
        return cb(err);
      }
    })
  );
  
  passport.serializeUser((user, cb) => {
    cb(null,{              
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,});
  });
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });
//End of login proccess

//Sign up page render
app.get('/sign-up', (req,res)=>{
    res.render('user_sign_up.ejs', {isUsernameValid : true});
});

app.post('/new-user-sign-up', async(req, res)=>{
    const name = req.body.fName;
    const lastname = req.body.lName;
    const tel = req.body.mobile;
    const username = req.body.username;
    const password =req.body.password;
    const hash = Hash(password); //Hashed password for more security

    //checking to see if user exist
    const check = await db.query("SELECT FROM users WHERE username= $1", [username]);

    if (check.rowCount > 0){ //username already exist
        res.render('user_sign_up.ejs', {isUsernameValid: false});
    }

    else {
        //Generating qrcode for the user and store it in 
        GenerateQR(username);

        //Storing user data on Data Base
        const query = 'INSERT INTO users (firstname, lastname, mobile, username, hash) VALUES ($1, $2, $3, $4, $5)';
        await db.query(query, [name, lastname, tel, username, hash], (error, result)=>{
            if (error) console.log("error adding to db");
            else{
                res.render('success-sign-up.ejs');
            }
        });
    }
});

// Scanning qrCode getting directed to user confidential page only admin can see this page
app.get('/users/:username/rally1', async(req, res)=>{
    if (isAdminAuth){
        const username = req.params.username;
        //fetching user first and last from db
        const query1 = `SELECT firstname, lastname
                        FROM users WHERE username = '${username}'`;
        const user = await db.query(query1);
        const {firstname, lastname} = user.rows[0];

        res.render('rally1.ejs', {firstname, lastname, username});
    }
    else {
        res.redirect('/admin');
    }
});

//After posting evaluation in user form inserting it to database
app.post('/submission/:username/rally1', async(req,res)=>{
    const username = req.params.username;
    const sec1 = req.body.sec1;
    const sec2 = req.body.sec2;
    const sec3 = req.body.sec3;
    
    UpdateRally(username, sec1, sec2, sec3);
    res.send("updated successfuly");
});


app.listen(port, ()=>{
    console.log(`App runing on port ${port}`);
});