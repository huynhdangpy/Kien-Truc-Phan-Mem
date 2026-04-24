package com.cqrs.config;

import com.cqrs.event.ProductEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Cấu hình Redis
 * 
 * Mục đích:
 * - Kết nối tới Redis Server
 * - Cấu hình serialization/deserialization cho Redis
 * - Tạo RedisTemplate Bean để thao tác với Redis
 * 
 * Hiệu suất:
 * - Redis cho phép ~100.000 request/giây
 * - Phù hợp cho các truy vấn có latency yêu cầu thấp
 */
@Configuration
public class RedisConfig {

    /**
     * RedisTemplate: Bean chính để thao tác với Redis
     * 
     * Serialization:
     * - Key: String
     * - Value: JSON (ProductEvent)
     * 
     * Điều này cho phép:
     * - Lưu trữ object Java dưới dạng JSON trong Redis
     * - Dễ dàng đọc/ghi dữ liệu
     * - Tương thích với các client khác
     */
    @Bean
    public RedisTemplate<String, ProductEvent> redisTemplate(
            RedisConnectionFactory connectionFactory) {

        RedisTemplate<String, ProductEvent> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // ============ SERIALIZATION SETTINGS ============

        // Jackson2JsonRedisSerializer để serialize ProductEvent thành JSON
        Jackson2JsonRedisSerializer<ProductEvent> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(
                ProductEvent.class);

        // StringRedisSerializer cho key
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();

        // ============ KEY SERIALIZERS ============
        template.setKeySerializer(stringRedisSerializer); // Key: String
        template.setHashKeySerializer(stringRedisSerializer); // Hash key: String

        // ============ VALUE SERIALIZERS ============
        template.setValueSerializer(jackson2JsonRedisSerializer); // Value: JSON
        template.setHashValueSerializer(jackson2JsonRedisSerializer); // Hash value: JSON

        template.afterPropertiesSet();

        return template;
    }
}
