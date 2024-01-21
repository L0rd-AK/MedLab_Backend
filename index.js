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
//  ==================== Stripe things ======================
const stripe = require("stripe")('sk_test_51Ob7HPC3ZF5K53fVTCqhHuYgS8xcN4eJlshMISkjObrHRn2yUlhvnKnvjvKt6NnNtWVV7aHL8Wkn4yFaaHdfSj0z00jUsJYU0i');
app.use(express.static("public"));
app.use(express.json());
app.post("/create-payment-intent", async (req, res) => {
  const { price } = req.body;
  const amount=parseInt(price*100);
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    "payment_method_types": [
      "card",
      "link"
    ],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
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
    // ================= appointments api ==============
    app.post('/appointments', async(req,res)=>{
      const test=req.body;
      const result=await Appointments.insertOne(test);
      res.send(result);
  })
  app.get('/appointments', async(req,res)=>{
    const cursor=Appointments.find();
    const result=await cursor.toArray();
    res.send(result)
  })
  app.get('/appointments/:id', async(req,res)=>{
    const id = req.params.id;
    console.log("id",id);
    const query = {email: id};
    const result = Appointments.find(query);
    const ans=await result.toArray();
    res.send(ans)
    
  })
  app.put('/appointments/:id', async(req,res)=>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const options={upsert: true}
    const new_body=req.body;
    
    const Updated_user={
      $set:{
        approved: new_body.approved,
      }
      
    }
    const resust = await Appointments.updateOne(filter,Updated_user,options);
    console.log(resust);
    res.send(resust)
  })
  app.delete('/appointments/:id', async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await Appointments.deleteOne(query);
    res.send(result);
  });
    // ================= all test api =================
    app.post('/all-tests', async(req,res)=>{
      const test=req.body;
      const result=await AllTests.insertOne(test);
      res.send(result);
  })
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
    app.put('/all-tests/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options={upsert: true}
      const new_body=req.body;
      
      const Updated_user={
        $set:{
          testName: new_body.testName,
          imageUrl: new_body.imageUrl,
          details: new_body.details,
          price: new_body.price,
          date: new_body.date,
          slots: new_body.slots,
        }
        
      }
      const resust = await AllTests.updateOne(filter,Updated_user,options);
      console.log(resust);
      res.send(resust)
    })
    app.delete('/all-tests/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await AllTests.deleteOne(query);
      res.send(result);
    });
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
      console.log(result);
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
    // =============== make admin api ==================
    app.put('/makeAdmin/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options={upsert: true}
      const new_body=req.body;
      
      const Updated_user={
        $set:{
          isAdmin: new_body.isAdmin,
        }
        
      }
      const resust = await Users.updateOne(filter,Updated_user,options);
      res.send(resust)
    })
    app.put('/block/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options={upsert: true}
      const new_body=req.body;
      
      // { ,,,,: User_Description }
      const Updated_user={
        $set:{
          status: new_body.status,
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