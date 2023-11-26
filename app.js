const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser')
require('dotenv').config()
// var jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000;


// middleware
app.use(express.json())
app.use(cors({
    origin: [
        "http://localhost:5173"],
    credentials: true
}))
app.use(cookieParser())

// custom middleware
const verify = (req, res, next) => {
    const cookie = req?.cookies?.token;
    if (!cookie) {
        console.log('cookie not found')
        return res.status(401).send({ massage: 'unauthorized access' })
    }
    jwt.verify(cookie, process.env.PRIVATE_KEY, (err, decode) => {
        if (err) {
            return res.status(401).send({ massage: 'unauthorized access' })
        }
        req.user = decode
        next()
    })
}

// mongodb connection
const uri =process.env.DB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        // // jwt authorization apis
        // app.post('/api/v1/access', async (req, res) => {
        //     const user = req.body;
        //     const token = jwt.sign(user, process.env.PRIVATE_KEY, { expiresIn: "1h" })
        //     console.log(token)
        //     res
        //         .cookie("token", token, {
        //             httpOnly: true,
        //             secure: process.env.NODE_ENV === 'production',
        //             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //             // secure: true,
        //             // sameSite: "none",
        //         })
        //         .send({ success: true })
        // })

        // app.post('/api/v1/logout', async (req, res) => {
        //     const user = req.body;
        //     console.log(user)
        //     res
        //         .clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true })
        //         .send({ success: true })
        // })

        // users apis
        const userCollection = client.db(process.env.DB_NAME).collection("users")
        app.post('/users',async(req,res)=>{
            const user= req.body;
            const query = {email:user.email}
            const existingUser = await userCollection.findOne(query)
            if(existingUser){
                return res.send({message:'user already exist', insertedId:null})
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        })
        app.get('/users',async(req,res)=>{
            const result = await userCollection.find().toArray()
            res.send(result)
        })
       

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, (req, res) => {
    console.log(`server is running on the port of ${port}`)
})