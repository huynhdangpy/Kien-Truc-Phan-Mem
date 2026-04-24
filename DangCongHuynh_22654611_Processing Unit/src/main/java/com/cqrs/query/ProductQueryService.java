package com.cqrs.query;

import com.cqrs.event.ProductEvent;
import com.cqrs.read.ProductReadService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Query Service - Xử lý các yêu cầu đọc dữ liệu
 * 
 * Đây là phần Query-side của kiến trúc CQRS
 * - Chỉ đọc dữ liệu từ Redis
 * - Không ghi dữ liệu
 * - Cực nhanh: ~1-5ms response time
 * - Hỗ trợ 100.000+ request/giây
 * 
 * Tuân thủ nguyên tắc Single Responsibility:
 * - Query Service: Chỉ xử lý READ queries
 * - Delegate tới ProductReadService để lấy data từ Redis
 */
@Service
public class ProductQueryService {

    private static final Logger logger = LoggerFactory.getLogger(ProductQueryService.class);

    // ProductReadService để lấy dữ liệu từ Redis
    private final ProductReadService productReadService;

    @Autowired
    public ProductQueryService(ProductReadService productReadService) {
        this.productReadService = productReadService;
    }

    /**
     * Query: Lấy product theo ID
     * 
     * Quy trình:
     * 1. Log request
     * 2. Validate productId
     * 3. Gọi ProductReadService để lấy từ Redis
     * 4. Return kết quả
     * 
     * Performance:
     * - Redis lookup: ~1-5ms
     * - Network latency: ~1-2ms
     * - Total: ~2-7ms (rất nhanh!)
     * 
     * @param productId - ID của product cần lấy
     * @return ProductEvent từ Redis, hoặc null nếu không tồn tại
     * @throws IllegalArgumentException nếu productId không hợp lệ
     */
    public ProductEvent getProductById(Long productId) {
        logger.info("🔍 Query Service: Lấy product - Product ID: {}", productId);

        // Validate input
        if (productId == null || productId <= 0) {
            logger.error("❌ Product ID không hợp lệ");
            throw new IllegalArgumentException("Product ID phải > 0");
        }

        try {
            // Lấy từ Redis thông qua ProductReadService
            ProductEvent product = productReadService.getProductFromCache(productId);

            if (product != null) {
                logger.info("✅ Tìm thấy product: {}", product.getProductName());
                return product;
            } else {
                logger.warn("⚠️ Product không tìm thấy trong cache - ID: {}", productId);
                return null;
            }

        } catch (Exception e) {
            logger.error("❌ Lỗi khi query product: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy product", e);
        }
    }

    /**
     * Query: Kiểm tra product có tồn tại hay không
     * 
     * @param productId - ID của product
     * @return true nếu tồn tại, false nếu không
     */
    public boolean isProductExists(Long productId) {
        logger.debug("🔍 Kiểm tra product tồn tại - Product ID: {}", productId);

        if (productId == null || productId <= 0) {
            return false;
        }

        try {
            ProductEvent product = productReadService.getProductFromCache(productId);
            return product != null;

        } catch (Exception e) {
            logger.error("❌ Lỗi khi kiểm tra product: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Query: Lấy thông tin giá của product
     * 
     * @param productId - ID của product
     * @return Giá sản phẩm, hoặc null nếu không tồn tại
     */
    public Double getProductPrice(Long productId) {
        logger.debug("💰 Lấy giá product - Product ID: {}", productId);

        try {
            ProductEvent product = productReadService.getProductFromCache(productId);

            if (product != null) {
                logger.debug("✅ Giá product: {}", product.getPrice());
                return product.getPrice();
            } else {
                logger.warn("⚠️ Product không tìm thấy");
                return null;
            }

        } catch (Exception e) {
            logger.error("❌ Lỗi khi lấy giá: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Query: Lấy số lượng hàng tồn của product
     * 
     * @param productId - ID của product
     * @return Số lượng tồn, hoặc null nếu không tồn tại
     */
    public Integer getProductQuantity(Long productId) {
        logger.debug("📦 Lấy số lượng product - Product ID: {}", productId);

        try {
            ProductEvent product = productReadService.getProductFromCache(productId);

            if (product != null) {
                logger.debug("✅ Số lượng product: {}", product.getQuantity());
                return product.getQuantity();
            } else {
                logger.warn("⚠️ Product không tìm thấy");
                return null;
            }

        } catch (Exception e) {
            logger.error("❌ Lỗi khi lấy số lượng: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Query: Lấy thông tin chi tiết product
     * 
     * @param productId - ID của product
     * @return DTO chứa thông tin chi tiết, hoặc null nếu không tồn tại
     */
    public ProductDetailDTO getProductDetails(Long productId) {
        logger.info("📋 Lấy chi tiết product - Product ID: {}", productId);

        try {
            ProductEvent product = productReadService.getProductFromCache(productId);

            if (product != null) {
                // Map từ ProductEvent sang DTO
                ProductDetailDTO dto = new ProductDetailDTO();
                dto.setProductId(product.getProductId());
                dto.setProductName(product.getProductName());
                dto.setDescription(product.getDescription());
                dto.setPrice(product.getPrice());
                dto.setQuantity(product.getQuantity());
                dto.setLastUpdated(product.getTimestamp());

                logger.info("✅ Trả về chi tiết product");
                return dto;
            } else {
                logger.warn("⚠️ Product không tìm thấy");
                return null;
            }

        } catch (Exception e) {
            logger.error("❌ Lỗi khi lấy chi tiết product: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * DTO: Chi tiết sản phẩm
     * 
     * Được trả về từ API endpoint
     */
    public static class ProductDetailDTO {
        private Long productId;
        private String productName;
        private String description;
        private Double price;
        private Integer quantity;
        private java.time.LocalDateTime lastUpdated;

        // Getters & Setters
        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public java.time.LocalDateTime getLastUpdated() {
            return lastUpdated;
        }

        public void setLastUpdated(java.time.LocalDateTime lastUpdated) {
            this.lastUpdated = lastUpdated;
        }

        @Override
        public String toString() {
            return "ProductDetailDTO{" +
                    "productId=" + productId +
                    ", productName='" + productName + '\'' +
                    ", price=" + price +
                    ", quantity=" + quantity +
                    ", lastUpdated=" + lastUpdated +
                    '}';
        }
    }
}
