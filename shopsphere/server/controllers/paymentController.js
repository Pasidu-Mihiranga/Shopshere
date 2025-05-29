// server/controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const User = require('../models/User');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user._id.toString()
      }
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    
    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }
    
    // Update order with payment info
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        'payment.status': 'completed',
        'payment.transactionId': paymentIntentId,
        status: 'processing'
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};

// Create payment method
exports.createPaymentMethod = async (req, res) => {
  try {
    const { cardNumber, expMonth, expYear, cvc } = req.body;
    
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc
      }
    });
    
    res.status(200).json({
      paymentMethodId: paymentMethod.id
    });
  } catch (error) {
    console.error('Error creating payment method:', error);
    res.status(500).json({ message: 'Failed to process payment details' });
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.status(200).json({ received: true });
};

// Helper functions
async function handleSuccessfulPayment(paymentIntent) {
  try {
    // Find order by transaction ID and update
    await Order.findOneAndUpdate(
      { 'payment.transactionId': paymentIntent.id },
      { 
        'payment.status': 'completed',
        status: 'processing'
      }
    );
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentIntent) {
  try {
    // Find order by transaction ID and update
    await Order.findOneAndUpdate(
      { 'payment.transactionId': paymentIntent.id },
      { 
        'payment.status': 'failed',
        status: 'payment_failed'
      }
    );
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}