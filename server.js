const express = require('express');
const dotenv = require('dotenv');
const Stripe = require('stripe');

dotenv.config();

if (!process.env.stripe_api || !process.env.DOMAIN) {
  console.error('Missing required environment variables!');
  process.exit(1);
}

const stripeGateway = new Stripe(process.env.stripe_api, { apiVersion: '2023-08-16' });
const DOMAIN = process.env.DOMAIN;

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.get("/success", (req, res) => {
  res.sendFile('success.html', { root: 'public' });
});

app.get("/cancel", (req, res) => {
  res.sendFile('cancel.html', { root: 'public' });
});

app.post('/stripe-checkout', async (req, res) => {
  try {
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

    const session = await stripeGateway.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${DOMAIN}/success`,
      cancel_url: `${DOMAIN}/cancel`,
      line_items: lineItems,
      billing_address_collection: 'required',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.listen(3000, () => {
  console.log('listening on port 3000;');
});
