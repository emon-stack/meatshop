require('dotenv').config()
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const PORT  = process.env.PORT || 4000

const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('express-flash')
const MongoStore = require ('connect-mongo');app.use(flash())
const passport = require('passport')
const Emitter = require ('events')


// database connection

mongoose.connect(process.env.MONGO_CONNECTION_URL,{ useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true,
 useFindAndModify: true });
 const connection = mongoose.connection;
 connection.once('open', () => {
     console.log('Database connected...');
 }).catch(err => {
     console.log('Connection failed...');
 });

 //Event emitter
 const eventEmitter = new Emitter()
 app.set('eventEmitter', eventEmitter)

 
 

 //session configaretion
app.use(session({
    secret : process.env.COOKIE_SECRET,
    resave : false ,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl:"mongodb://localhost/meatshop",
        collection: 'sessions',
    }),
    cookie : {maxAge: 1000*60*60*24 }
}))

//passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


//global middleware
app.use( (req,res,next) =>{
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})
 

//assets
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))









require('./routes/web')(app)



//set template engine
app.use(expressLayout)
app.set('views',path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')



//


 const server = app.listen(PORT, () =>{
    console.log('listening on port 4000')
});

//Socket
const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // join
    socket.on('join',(orderId) => {
        socket.join(orderId)
    })
})

eventEmitter.on('orderupdated', (data) => {
    io.to(`order_${data.id}`).emit('orderupdated',data)
})

eventEmitter.on('orderPlaced' , (data) => {
    io.to('adminRoom').emit('orderPlaced',data)
})


