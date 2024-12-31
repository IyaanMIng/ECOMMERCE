import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // API key loaded from .env

// Stripe Checkout endpoint
app.post('/stripe-checkout', async (req, res) => {
    const cartItems = req.body.items;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: cartItems.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price * 100, // Convert to cents
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: 'http://localhost:3000/success', // Replace with your success URL
            cancel_url: 'http://localhost:3000/cancel',   // Replace with your cancel URL
        });

        res.json({ url: session.url }); // Send session URL back to the client
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
