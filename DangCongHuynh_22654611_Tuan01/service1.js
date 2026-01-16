// service1.js
const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

const QUEUE_NAME = "order_queue";

async function sendEvent(data) {
  try {
    // 1. Kết nối tới RabbitMQ (localhost:5672)
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    // 2. Khởi tạo Queue
    await channel.assertQueue(QUEUE_NAME, { durable: false });

    // 3. Gửi tin nhắn vào Queue
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)));
    console.log(" [x] Service 1 sent:", data);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error in Service 1:", error);
  }
}

app.post("/send", async (req, res) => {
  const message = req.body;
  await sendEvent(message);
  res.status(200).send({ status: "Event Sent!", data: message });
});

app.listen(3001, () => console.log("Service 1 is running on port 3001"));
