require('dotenv').config();  // Load .env variables at the start
const express = require('express');
const axios = require('axios');
const app = express();

// Express JSON middleware to handle JSON body
app.use(express.json());

// Webhook endpoint to receive order data
app.post('/order-webhook', (req, res) => {
    const order = req.body;
    const customerPhone = order.phone;
    const totalAmount = order.total_price;

    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SENDER_ID;
    const smsApiUrl = process.env.SMS_API_URL;
    
    const message = `সম্মানিত গ্রাহক, আপনার অর্ডারটি কনফার্ম করা হয়েছে, ডেলিভারি এজেন্ট কল দিলে, অবশ্যই পার্সেলটি রিসিভ করে নিবেন। <br> টোটাল বিল: ${totalAmount} টাকা। <br> কল করুন 01303559063 chinatobd.shop সাথে থাকার জন্য ধন্যবাদ`;

    // Elitbuzz API URL with environment variables
    const fullSmsApiUrl = `${smsApiUrl}?api_key=${apiKey}&type=text&contacts=${customerPhone}&senderid=${senderId}&msg=${encodeURIComponent(message)}`;

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
