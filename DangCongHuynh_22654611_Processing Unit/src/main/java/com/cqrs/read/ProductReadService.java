package com.cqrs.read;

import com.cqrs.event.ProductEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Read Service - Consumer/Listener
 * 
 * Quy trình (Read-side):
 * 1. Lắng nghe sự kiện từ RabbitMQ (read-mq queue)
 * 2. Nhận ProductEvent được phát hành từ Write-side
 * 3. Cập nhật dữ liệu vào Redis cho hiệu suất cao
 * 4. Tuân thủ nguyên tắc Event Sourcing
 * 
 * Lợi ích:
 * - Redis là in-memory database: response time ~1-5ms
 * - Hỗ trợ 100.000+ request/giây
 * - Tách biệt read model và write model
 * - Có thể scale read-side độc lập
 */
@Service
public class ProductReadService {

    private static final Logger logger = LoggerFactory.getLogger(ProductReadService.class);

    /**
     * Redis key prefix cho product cache
     * Ví dụ: product:1, product:2, ...
     */
    private static final String PRODUCT_CACHE_PREFIX = "product:";

    /**
     * TTL (Time To Live) cho cache: 24 giờ (86400 giây)
     * Sau thời gian này, dữ liệu sẽ tự động xóa khỏi Redis
     */
    private static final long CACHE_TTL_SECONDS = 86400;

    // RedisTemplate để thao tác với Redis
    private final RedisTemplate<String, ProductEvent> redisTemplate;

    @Autowired
    public ProductReadService(RedisTemplate<String, ProductEvent> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Listener method - Lắng nghe message từ read-mq queue
     * 
     * @RabbitListener: Spring sẽ tự động:
     *                  - Kết nối tới read-mq queue
     *                  - Chờ message
     *                  - Gọi method này khi có message
     *                  - Deserialize JSON thành ProductEvent
     * 
     * @param event - Sự kiện ProductEvent nhận từ RabbitMQ
     */
    @RabbitListener(queues = "read-mq")
    public void handleProductEvent(ProductEvent event) {
        logger.info("📨 Read-side: Nhận sự kiện từ RabbitMQ - {}", event);

        try {
            // Validate event
            if (event == null || event.getProductId() == null) {
                logger.error("❌ Event không hợp lệ");
                return;
            }

            // Xử lý theo loại event
            switch (event.getEventType()) {
                case "CREATE":
                    handleCreateEvent(event);
                    break;

                case "UPDATE":
                    handleUpdateEvent(event);
                    break;

                case "DELETE":
                    handleDeleteEvent(event);
                    break;

                default:
                    logger.warn("⚠️ Event type không được hỗ trợ: {}", event.getEventType());
            }

        } catch (Exception e) {
            logger.error("❌ Lỗi khi xử lý sự kiện: {}", e.getMessage(), e);
            // Có thể implement DLQ (Dead Letter Queue) để xử lý message lỗi
        }
    }

    /**
     * Xử lý sự kiện CREATE
     * 
     * Bước 1: Validate dữ liệu
     * Bước 2: Lưu ProductEvent vào Redis
     * Bước 3: Set TTL (Time To Live) cho key
     * 
     * @param event - Sự kiện CREATE
     */
    private void handleCreateEvent(ProductEvent event) {
        logger.info("🆕 Xử lý sự kiện CREATE - Product ID: {}", event.getProductId());

        try {
            // Bước 1: Validate
            if (event.getProductName() == null || event.getProductName().isEmpty()) {
                logger.error("❌ Product Name không hợp lệ");
                return;
            }

            // Bước 2: Tạo cache key (ví dụ: product:123)
            String cacheKey = PRODUCT_CACHE_PREFIX + event.getProductId();

            // Bước 3: Lưu vào Redis
            // redisTemplate.opsForValue(): Lấy ValueOperations để set/get value
            redisTemplate.opsForValue().set(cacheKey, event, CACHE_TTL_SECONDS, TimeUnit.SECONDS);

            logger.info("✅ Product đã được lưu vào Redis - Key: {}, TTL: {} giây",
                    cacheKey, CACHE_TTL_SECONDS);

        } catch (Exception e) {
            logger.error("❌ Lỗi khi lưu product vào Redis: {}", e.getMessage(), e);
        }
    }

    /**
     * Xử lý sự kiện UPDATE
     * 
     * Bước 1: Kiểm tra key có tồn tại trong Redis
     * Bước 2: Cập nhật giá trị
     * Bước 3: Refresh TTL
     * 
     * @param event - Sự kiện UPDATE
     */
    private void handleUpdateEvent(ProductEvent event) {
        logger.info("🔄 Xử lý sự kiện UPDATE - Product ID: {}", event.getProductId());

        try {
            String cacheKey = PRODUCT_CACHE_PREFIX + event.getProductId();

            // Bước 1: Kiểm tra key tồn tại
            Boolean keyExists = redisTemplate.hasKey(cacheKey);
            if (keyExists != null && keyExists) {
                // Bước 2: Cập nhật value
                redisTemplate.opsForValue().set(cacheKey, event, CACHE_TTL_SECONDS, TimeUnit.SECONDS);
                logger.info("✅ Product đã được cập nhật trong Redis - Key: {}", cacheKey);
            } else {
                // Nếu key không tồn tại, tạo mới (trường hợp race condition)
                logger.warn("⚠️ Key {} không tồn tại, tạo mới", cacheKey);
                redisTemplate.opsForValue().set(cacheKey, event, CACHE_TTL_SECONDS, TimeUnit.SECONDS);
            }

        } catch (Exception e) {
            logger.error("❌ Lỗi khi cập nhật product trong Redis: {}", e.getMessage(), e);
        }
    }

    /**
     * Xử lý sự kiện DELETE
     * 
     * Bước 1: Xóa key khỏi Redis
     * 
     * @param event - Sự kiện DELETE
     */
    private void handleDeleteEvent(ProductEvent event) {
        logger.info("🗑️ Xử lý sự kiện DELETE - Product ID: {}", event.getProductId());

        try {
            String cacheKey = PRODUCT_CACHE_PREFIX + event.getProductId();

            // Xóa key khỏi Redis
            Boolean deleted = redisTemplate.delete(cacheKey);

            if (deleted != null && deleted) {
                logger.info("✅ Product đã bị xóa khỏi Redis - Key: {}", cacheKey);
            } else {
                logger.warn("⚠️ Key {} không tồn tại hoặc đã bị xóa trước đó", cacheKey);
            }

        } catch (Exception e) {
            logger.error("❌ Lỗi khi xóa product khỏi Redis: {}", e.getMessage(), e);
        }
    }

    /**
     * Utility method: Lấy product từ Redis cache
     * 
     * Dùng bởi Query Service để retrieve dữ liệu
     * 
     * @param productId - ID của product
     * @return ProductEvent từ Redis, hoặc null nếu không tồn tại
     */
    public ProductEvent getProductFromCache(Long productId) {
        logger.debug("🔍 Lấy product từ Redis - Product ID: {}", productId);

        try {
            String cacheKey = PRODUCT_CACHE_PREFIX + productId;
            ProductEvent product = redisTemplate.opsForValue().get(cacheKey);

            if (product != null) {
                logger.debug("✅ Tìm thấy product trong cache");
                return product;
            } else {
                logger.debug("⚠️ Product không tồn tại trong cache");
                return null;
            }

        } catch (Exception e) {
            logger.error("❌ Lỗi khi lấy product từ Redis: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Utility method: Xóa product khỏi cache (manual)
     * 
     * @param productId - ID của product
     */
    public void deleteProductFromCache(Long productId) {
        logger.debug("🗑️ Xóa product khỏi cache - Product ID: {}", productId);

        try {
            String cacheKey = PRODUCT_CACHE_PREFIX + productId;
            redisTemplate.delete(cacheKey);
            logger.debug("✅ Product đã bị xóa khỏi cache");

        } catch (Exception e) {
            logger.error("❌ Lỗi khi xóa product khỏi cache: {}", e.getMessage(), e);
        }
    }

    /**
     * Utility method: Xóa tất cả product cache (cleanup)
     * 
     * Sử dụng khi cần invalidate toàn bộ cache
     */
    public void invalidateAllCache() {
        logger.info("🧹 Invalidate tất cả product cache");

        try {
            // Lấy tất cả key bắt đầu với PRODUCT_CACHE_PREFIX
            redisTemplate.delete(
                    redisTemplate.keys(PRODUCT_CACHE_PREFIX + "*"));
            logger.info("✅ Toàn bộ cache đã bị xóa");

        } catch (Exception e) {
            logger.error("❌ Lỗi khi invalidate cache: {}", e.getMessage(), e);
        }
    }
}
