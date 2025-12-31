const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
});

console.log('Testing Stripe API Key...');
console.log('Key (first 20 chars):', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...');

stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
  automatic_payment_methods: { enabled: true },
})
.then(pi => {
  console.log('✅ SUCCESS! Payment Intent created:', pi.id);
  console.log('   Status:', pi.status);
  process.exit(0);
})
.catch(err => {
  console.log('❌ ERROR:', err.message);
  console.log('   Type:', err.type);
  console.log('   Code:', err.code);
  process.exit(1);
});
