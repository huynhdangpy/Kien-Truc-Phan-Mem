package com.cqrs.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình RabbitMQ
 * 
 * Tài nguyên được tạo:
 * - Direct Exchange: để định tuyến tin nhắn dựa trên routing key
 * - Queues: write-mq và read-mq cho Write-side và Read-side
 * - Bindings: kết nối Exchange với Queues
 * - RabbitTemplate: Bean để gửi message
 * - MessageConverter: chuyển đổi JSON <-> Java Object
 */
@Configuration
public class RabbitMQConfig {

    // ============ EXCHANGE ============
    /**
     * Tạo Direct Exchange để định tuyến message dựa trên routing key
     * Điều này cho phép gửi message đến các queue khác nhau
     */
    @Bean
    public DirectExchange productExchange() {
        return new DirectExchange("product-exchange", true, false);
    }

    // ============ QUEUES ============
    /**
     * Queue cho Write-side: tiếp nhận yêu cầu ghi
     * durable=true: message vẫn tồn tại khi RabbitMQ restart
     */
    @Bean
    public Queue writeQueue() {
        return new Queue("write-mq", true);
    }

    /**
     * Queue cho Read-side: lắng nghe sự kiện và cập nhật Redis
     */
    @Bean
    public Queue readQueue() {
        return new Queue("read-mq", true);
    }

    // ============ BINDINGS ============
    /**
     * Binding: kết nối Write Queue với Exchange
     * Routing key: "product.write" - dùng khi Write-side gửi message
     */
    @Bean
    public Binding bindingWrite(Queue writeQueue, DirectExchange productExchange) {
        return BindingBuilder.bind(writeQueue)
                .to(productExchange)
                .with("product.write");
    }

    /**
     * Binding: kết nối Read Queue với Exchange
     * Routing key: "product.read" - dùng khi Read-side lắng nghe
     */
    @Bean
    public Binding bindingRead(Queue readQueue, DirectExchange productExchange) {
        return BindingBuilder.bind(readQueue)
                .to(productExchange)
                .with("product.read");
    }

    // ============ TEMPLATE & CONVERTER ============
    /**
     * RabbitTemplate: Bean factory để gửi message
     * Được inject vào các service để gửi message
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        // Sử dụng Jackson2JsonMessageConverter để serialize/deserialize JSON
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }

    /**
     * MessageConverter: chuyển đổi giữa JSON và Java Object
     * Giúp việc truyền tải dữ liệu giữa các service dễ dàng hơn
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
