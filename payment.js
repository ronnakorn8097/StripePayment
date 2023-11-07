const express = require("express");
const app = express();
const PORT = 8000;
app.use(express.json())

const stripe = require("stripe")(process.env.API_STRIPE);
const { products } = require("./routes/product-route");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


app.post("/create/product", products);

app.post("/", async (req, res) => {
  // const products = req.body.products;
  // const productIds = products.map((e) => e.id);
  // console.log(products);
  // console.log(productIds);

  // const data = await prisma.product.findMany({
  //   where: {
  //     id: { in: productIds },
  //   },
  // });

  // let line_items = [];
  // for (let d of data) {
  //   const obj = {
  //     price: "",
  //     quantity: 0,
  //   };
  //   obj.price = d.stripe_API_ID;
  //   obj.quantity = products.filter((e) => d.id === e.id)[0].qty;
  //   line_items.push(obj);
  // }

  // console.log(line_items);

  const session = await stripe.checkout.sessions.create({
    success_url: "https://www.google.com",
    line_items: [
      { price: "price_1O8dHOG4yvuKtvGS2D2juSFz", quantity: 4 },
   
    ],
     mode: "payment",
  
  });
  res.status(200).json({
    // url สำหรับจ่ายเงิน
    paymentUrl: session,  
  });
});

const endpointSecret = "whsec_55a6cc67f0485d89727f80b50c9a26ff70682bec34cfd37797af7be5309c04f0";

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;
console.log(request.body)
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.async_payment_succeeded':
      const checkoutSessionAsyncPaymentSucceeded = event.data.object;
      console.log(checkoutSessionAsyncPaymentSucceeded)
      // Then define and call a function to handle the event checkout.session.async_payment_succeeded
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);

  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});


app.listen(PORT, () => {
  console.log("Server test run PORT", PORT);
});
