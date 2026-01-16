// service2.js
const amqp = require("amqplib");

const QUEUE_NAME = "order_queue";

async function consumeEvent() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: false });

    console.log(
      " [*] Service 2 is waiting for events in %s. To exit press CTRL+C",
      QUEUE_NAME
    );

    // Lắng nghe tin nhắn
    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        console.log(" [x] Service 2 received and processing:", content);

        // Giả lập xử lý logic (ví dụ: lưu database, gửi email...)
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error in Service 2:", error);
  }
}

consumeEvent();
