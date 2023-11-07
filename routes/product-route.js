const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')('sk_test_51O82irG4yvuKtvGSN2Ynavr52Qi0XDE10yz7WNfd09Mk0hOGjqkLGwrpOYBkaj7tOrWlDDJ7l2usglY0e7LaPjqk00OCAW1b7d');

exports.products = async (req,res,next)=> {
    try {
        const addProduct = req.body
       
      let product = {}
        // console.log(product, "product")
        await stripe.products.create({
            name : addProduct.name,
            description : addProduct.description
           
        }).then(async(result) => {
            // result oj จะมีค่า id 
           // หลังจาก create product เราต้องนำค่า id : 'prod_XXXXXXXXX' uniq ไปใส่ที่ key product ของ price 
           // เพื่อให้ได้ค่า api_id นำไปจ่ายเงิน
           const resultPid = await stripe.prices.create({
                unit_amount : addProduct.price*100,
                currency : 'thb',
                billing_scheme : "per_unit",
                product : `${result.id}`
            })
            await stripe.products.update(`${result.id}`,{
                //ใส่รูป
                images : ['https://picsum.photos/200/300']
            })
           product = await prisma.product.create({
                data :  {
                    id : addProduct.id,
                    name : addProduct.name,
                    price : addProduct.price,
                    description : addProduct.description,
                    stripe_API_ID : resultPid.id
                }
            })
             
            
        }).catch((err) => {
            console.log('error is', err)
            next(err)
        });

        res.json({product})
    } catch (error) {
        next(error)
    }
}
