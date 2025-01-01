import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import cors from 'cors'; // Import CORS

// Load environment variables from the .env file
dotenv.config();

// Validate environment variables
if (!process.env.stripe_api || !process.env.DOMAIN) {
  console.error('Missing required environment variables!');
  process.exit(1); // Exit the application if variables are missing
}

// Initialize Stripe with the secret key
const stripeGateway = new Stripe(process.env.stripe_api, {
  apiVersion: '2023-08-16', // Use the latest or desired API version
});

// Access DOMAIN
const DOMAIN = process.env.DOMAIN;

// Start Server
const app = express();

// Updated CORS configuration
app.use(cors({
  origin: [
    'https://ecommerce-2-lak9.onrender.com',  // Your frontend domain on Render
    'http://localhost:3000',  // Localhost for development
  ],
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.static('public')); // Serve static files from the public folder
app.use(express.json()); // Parse incoming JSON requests

// Home Route
app.get("/", (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Success Route
app.get("/success", (req, res) => {
  res.sendFile('success.html', { root: 'public' });
});

// Cancel Route
app.get("/cancel", (req, res) => {
  res.sendFile('cancel.html', { root: 'public' });
});

// Stripe Checkout Route
app.post('/stripe-checkout', async (req, res) => {
  try {
    // Map items from the client-side to the required Stripe format
    const lineItems = req.body.items.map((item) => {
      const unitAmount = Math.round(parseFloat(item.price.replace(/[^0-9.-]+/g, '')) * 100);
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            images: [item.productImg],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    // Create a Stripe Checkout Session
    const session = await stripeGateway.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${DOMAIN}/success`,
      cancel_url: `${DOMAIN}/cancel`,
      line_items: lineItems,
      billing_address_collection: 'required',
    });

    // Respond with the session URL
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Start Listening
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

