const express=require('express');
const cors=require('cors');
//const jwt=require('jsonwebtoken');
//const cookieParser=require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const port=process.env.PORT || 5000;

// ==========middleware==========
app.use(cors({
    origin:['http://localhost:5173'],
    credentials: true
  }));
app.use(express.json());
 //app.use(cookieParser());
// ==================== mongoDB atlas ====================
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9t7oll.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    // Send a ping to confirm a successful connection
    const HealthTips=client.db('MedLab').collection('Health_Tips')
    const Users=client.db('MedLab').collection('Users')
    const AllTests=client.db('MedLab').collection('AllTests')
    const Appointments=client.db('MedLab').collection('Appointments')
    // ========================================= Health tips api =============================================================
    app.get('/tips', async(req,res)=>{
          const cursor=HealthTips.find();
          const result=await cursor.toArray();
          res.send(result)
    })
    // ================= appointments api =============
    app.post('/appointments', async(req,res)=>{
      const test=req.body;
      const result=await Appointments.insertOne(test);
      res.send(result);
  })
  app.get('/appointments/:id', async(req,res)=>{
    const id = req.params.id;
    console.log("id",id);
    const query = {email: id};
    const result = Appointments.find(query);
    const ans=await result.toArray();
    res.send(ans)
    
  })
    // ================= all test api =================
    app.get('/all-tests', async(req,res)=>{
      const cursor=AllTests.find();
      const result=await cursor.toArray();
      res.send(result)
    })
    app.get('/all-tests/:id', async(req,res)=>{
      const id = req.params.id;
      console.log("id",id);
      const query = {_id: new ObjectId(id)};
      const result = await AllTests.findOne(query);
      console.log(result);
      res.send(result)
    })
    // ========================= post users + update user =============================
    app.get('/users', async(req,res)=>{
      const cursor=Users.find();
      const result=await cursor.toArray();
      res.send(result)
    })
    app.get('/users/:id', async(req,res)=>{
      const id = req.params.id;
      console.log("id",id);
      const query = {email: id};
      const result = await Users.findOne(query);
      res.send(result)
    })
    app.post('/users', async(req,res)=>{
        const user=req.body;
        const query={email: user.email}
        const existingUser= await Users.findOne(query)
        if(existingUser){
            return res.send({message:'user already exist',insertedId:null})
        }
        const result=await Users.insertOne(user);
        res.send(result);
    })
    app.put('/users/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options={upsert: true}
      const new_body=req.body;
      
      // { ,,,,: User_Description }
      const Updated_user={
        $set:{
          name: new_body.name,
          selected_BloodType: new_body.selected_BloodType,
          Country: new_body.Country,
          State: new_body.State,
          User_Description: new_body.User_Description,
        }
        
      }
      const resust = await Users.updateOne(filter,Updated_user,options);
      res.send(resust)
    })
    // ======================================================
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

// =================== basic backend ==========================
app.get('/',(req,res)=>{
    res.send('Backend is running')
})
app.listen(port,()=>{
    console.log(`backend is running on port ${port}`);
})