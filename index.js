require('dotenv').config();  // Load .env variables at the start
const express = require('express');
const axios = require('axios');
const app = express();

// Express JSON middleware to handle JSON body
app.use(express.json());

// Webhook endpoint to receive order data
app.post('/order-webhook', (req, res) => {
    const order = req.body;

    // Log the incoming order data to see the structure
    console.log('Incoming order data:', order);

    const customerPhone = order.phone;
    const totalAmount = order.total_price;

    // Log important fields to ensure data is correctly received
    console.log('Customer phone:', customerPhone);
    console.log('Order total amount:', totalAmount);

    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SENDER_ID;
    const smsApiUrl = process.env.SMS_API_URL;

    // Log the values being used for the API
    console.log('SMS API Key:', apiKey);
    console.log('Sender ID:', senderId);
    console.log('SMS API URL:', smsApiUrl);

    const message = `সম্মানিত গ্রাহক, আপনার অর্ডারটি কনফার্ম করা হয়েছে, ডেলিভারি এজেন্ট কল দিলে, অবশ্যই পার্সেলটি রিসিভ করে নিবেন। 
                    টোটাল বিল: ${totalAmount} টাকা। 
                    কল করুন 01303559063 
                    chinatobd.shop সাথে থাকার জন্য ধন্যবাদ`;

    // Elitbuzz API URL with environment variables
    const fullSmsApiUrl = `${smsApiUrl}?api_key=${apiKey}&type=text&contacts=${customerPhone}&senderid=${senderId}&msg=${encodeURIComponent(message)}`;

    // Log the full API URL to ensure it's constructed correctly
    console.log('Full SMS API URL:', fullSmsApiUrl);

    // Sending SMS via API
    axios.get(fullSmsApiUrl)
        .then(response => {
            console.log("SMS sent successfully", response.data);
            res.sendStatus(200);
        })
        .catch(error => {
            console.error("Error sending SMS", error);
            res.sendStatus(500);
        });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
