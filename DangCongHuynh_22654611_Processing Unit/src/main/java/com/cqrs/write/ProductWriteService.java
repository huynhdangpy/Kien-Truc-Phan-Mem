package com.cqrs.write;

import com.cqrs.event.ProductEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Write Service - Xử lý logic ghi dữ liệu
 * 
 * Quy trình (Write-side):
 * 1. Tiếp nhận yêu cầu ghi sản phẩm
 * 2. Ghi dữ liệu vào Database chính
 * 3. Phát hành sự kiện (event) lên RabbitMQ
 * 4. Read-side sẽ lắng nghe và cập nhật Redis
 * 
 * Tuân thủ nguyên tắc CQRS:
 * - Write-side: Xử lý command, ghi vào DB, phát sự kiện
 * - Read-side: Lắng nghe sự kiện, cập nhật read model (Redis)
 * - Tách biệt giữa Write Model và Read Model
 */
@Service
public class ProductWriteService {

    private static final Logger logger = LoggerFactory.getLogger(ProductWriteService.class);

    // RabbitTemplate để gửi message lên message queue
    private final RabbitTemplate rabbitTemplate;

    // ProductRepository để thao tác với Database
    // (Giả định ProductRepository đã được tạo)
    private final ProductRepository productRepository;

    @Autowired
    public ProductWriteService(RabbitTemplate rabbitTemplate,
            ProductRepository productRepository) {
        this.rabbitTemplate = rabbitTemplate;
        this.productRepository = productRepository;
    }

    /**
     * Tạo sản phẩm mới
     * 
     * Bước 1: Ghi vào Database
     * Bước 2: Phát hành sự kiện CREATE lên RabbitMQ
     * 
     * @param event - Sự kiện chứa thông tin sản phẩm
     * @return ProductEntity - Sản phẩm đã được lưu
     * @throws IllegalArgumentException - Nếu dữ liệu không hợp lệ
     */
    @Transactional
    public ProductEntity createProduct(ProductEvent event) {
        logger.info("🔵 Write-side: Nhận yêu cầu tạo sản phẩm - Product ID: {}",
                event.getProductId());

        try {
            // Bước 1: Validate dữ liệu đầu vào
            validateProductEvent(event);

            // Bước 2: Ghi vào Database chính
            ProductEntity product = new ProductEntity();
            product.setProductId(event.getProductId());
            product.setProductName(event.getProductName());
            product.setDescription(event.getDescription());
            product.setPrice(event.getPrice());
            product.setQuantity(event.getQuantity());

            ProductEntity savedProduct = productRepository.save(product);
            logger.info("✅ Dữ liệu đã lưu vào Database - Product ID: {}",
                    savedProduct.getProductId());

            // Bước 3: Phát hành sự kiện lên RabbitMQ
            event.setEventType("CREATE");
            event.setSource("write-services");
            publishEvent(event);

            logger.info("📤 Sự kiện CREATE đã gửi lên RabbitMQ");
            return savedProduct;

        } catch (IllegalArgumentException e) {
            logger.error("❌ Lỗi validation: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("❌ Lỗi khi tạo sản phẩm: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo sản phẩm", e);
        }
    }

    /**
     * Cập nhật sản phẩm
     * 
     * Bước 1: Ghi vào Database
     * Bước 2: Phát hành sự kiện UPDATE lên RabbitMQ
     * 
     * @param event - Sự kiện chứa thông tin cập nhật
     * @return ProductEntity - Sản phẩm đã được cập nhật
     */
    @Transactional
    public ProductEntity updateProduct(ProductEvent event) {
        logger.info("🔵 Write-side: Nhận yêu cầu cập nhật sản phẩm - Product ID: {}",
                event.getProductId());

        try {
            // Bước 1: Validate dữ liệu
            validateProductEvent(event);

            // Bước 2: Tìm sản phẩm trong DB
            ProductEntity existingProduct = productRepository
                    .findById(event.getProductId())
                    .orElseThrow(() -> new RuntimeException(
                            "Sản phẩm không tồn tại: " + event.getProductId()));

            // Bước 3: Cập nhật thông tin
            existingProduct.setProductName(event.getProductName());
            existingProduct.setDescription(event.getDescription());
            existingProduct.setPrice(event.getPrice());
            existingProduct.setQuantity(event.getQuantity());

            ProductEntity updatedProduct = productRepository.save(existingProduct);
            logger.info("✅ Dữ liệu đã cập nhật trong Database - Product ID: {}",
                    updatedProduct.getProductId());

            // Bước 4: Phát hành sự kiện lên RabbitMQ
            event.setEventType("UPDATE");
            event.setSource("write-services");
            publishEvent(event);

            logger.info("📤 Sự kiện UPDATE đã gửi lên RabbitMQ");
            return updatedProduct;

        } catch (Exception e) {
            logger.error("❌ Lỗi khi cập nhật sản phẩm: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể cập nhật sản phẩm", e);
        }
    }

    /**
     * Xóa sản phẩm
     * 
     * Bước 1: Xóa khỏi Database
     * Bước 2: Phát hành sự kiện DELETE lên RabbitMQ
     * 
     * @param productId - ID của sản phẩm cần xóa
     */
    @Transactional
    public void deleteProduct(Long productId) {
        logger.info("🔵 Write-side: Nhận yêu cầu xóa sản phẩm - Product ID: {}", productId);

        try {
            // Bước 1: Kiểm tra sản phẩm tồn tại
            ProductEntity product = productRepository
                    .findById(productId)
                    .orElseThrow(() -> new RuntimeException(
                            "Sản phẩm không tồn tại: " + productId));

            // Bước 2: Xóa khỏi Database
            productRepository.deleteById(productId);
            logger.info("✅ Sản phẩm đã xóa khỏi Database - Product ID: {}", productId);

            // Bước 3: Phát hành sự kiện DELETE lên RabbitMQ
            ProductEvent event = new ProductEvent();
            event.setProductId(productId);
            event.setEventType("DELETE");
            event.setSource("write-services");
            publishEvent(event);

            logger.info("📤 Sự kiện DELETE đã gửi lên RabbitMQ");

        } catch (Exception e) {
            logger.error("❌ Lỗi khi xóa sản phẩm: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể xóa sản phẩm", e);
        }
    }

    /**
     * Phát hành sự kiện lên RabbitMQ
     * 
     * Sử dụng Direct Exchange với routing key "product.read"
     * Để read-side có thể lắng nghe và cập nhật Redis
     * 
     * @param event - Sự kiện cần phát hành
     */
    private void publishEvent(ProductEvent event) {
        try {
            // Gửi message tới Direct Exchange với routing key "product.read"
            // Điều này đảm bảo message sẽ được định tuyến tới read-mq queue
            rabbitTemplate.convertAndSend(
                    "product-exchange", // Exchange name
                    "product.read", // Routing key - để read-side lắng nghe
                    event);

            logger.debug("✅ Event được gửi: {}", event);

        } catch (Exception e) {
            logger.error("❌ Lỗi khi gửi sự kiện lên RabbitMQ: {}", e.getMessage(), e);
            // Nên implement retry logic ở đây (Retry mechanism)
            // Có thể sử dụng Spring Retry hoặc Dead Letter Queue
            throw new RuntimeException("Không thể gửi sự kiện", e);
        }
    }

    /**
     * Validate dữ liệu đầu vào
     * 
     * Kiểm tra:
     * - Product ID không null
     * - Product Name không trống
     * - Price > 0
     * - Quantity >= 0
     * 
     * @param event - Sự kiện cần validate
     * @throws IllegalArgumentException - Nếu dữ liệu không hợp lệ
     */
    private void validateProductEvent(ProductEvent event) {
        if (event.getProductId() == null || event.getProductId() <= 0) {
            throw new IllegalArgumentException("Product ID phải > 0");
        }

        if (event.getProductName() == null || event.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product Name không được trống");
        }

        if (event.getPrice() == null || event.getPrice() < 0) {
            throw new IllegalArgumentException("Price phải >= 0");
        }

        if (event.getQuantity() == null || event.getQuantity() < 0) {
            throw new IllegalArgumentException("Quantity phải >= 0");
        }

        logger.debug("✅ Validation thành công");
    }
}
