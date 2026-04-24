package com.cqrs.query;

import com.cqrs.event.ProductEvent;
import com.cqrs.write.ProductWriteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API Controller - API Gateway (BE)
 * 
 * Expose các endpoint cho client:
 * - POST /api/products - Tạo sản phẩm (Write)
 * - PUT /api/products/{id} - Cập nhật sản phẩm (Write)
 * - DELETE /api/products/{id} - Xóa sản phẩm (Write)
 * - GET /api/products/{id} - Lấy sản phẩm (Read - từ Redis)
 * - GET /api/products/{id}/price - Lấy giá (Read - từ Redis)
 * 
 * Tuân thủ RESTful API design:
 * - Resource-oriented URLs
 * - Meaningful HTTP methods (GET, POST, PUT, DELETE)
 * - Proper HTTP status codes
 * - Error handling
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    // Inject các service
    private final ProductWriteService writeService;
    private final ProductQueryService queryService;

    @Autowired
    public ProductController(ProductWriteService writeService,
            ProductQueryService queryService) {
        this.writeService = writeService;
        this.queryService = queryService;
    }

    // ============ WRITE ENDPOINTS (Command) ============

    /**
     * POST /api/products
     * 
     * Tạo sản phẩm mới
     * 
     * @param event - ProductEvent chứa thông tin sản phẩm
     * @return 201 Created - khi tạo thành công
     */
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductEvent event) {
        logger.info("📝 POST /api/products - Tạo sản phẩm mới");

        try {
            // Validate event
            if (event == null || event.getProductId() == null) {
                logger.error("❌ Request body không hợp lệ");
                return ResponseEntity.badRequest()
                        .body(new ApiErrorResponse("Request body không hợp lệ", 400));
            }

            // Gọi Write Service
            var result = writeService.createProduct(event);

            logger.info("✅ Sản phẩm đã tạo - ID: {}", result.getProductId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("Sản phẩm đã tạo thành công", result, 201));

        } catch (IllegalArgumentException e) {
            logger.error("❌ Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiErrorResponse(e.getMessage(), 400));

        } catch (Exception e) {
            logger.error("❌ Server error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Lỗi server: " + e.getMessage(), 500));
        }
    }

    /**
     * PUT /api/products/{id}
     * 
     * Cập nhật sản phẩm
     * 
     * @param productId - ID của sản phẩm cần cập nhật
     * @param event     - ProductEvent chứa thông tin cập nhật
     * @return 200 OK - khi cập nhật thành công
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable("id") Long productId,
            @RequestBody ProductEvent event) {

        logger.info("✏️ PUT /api/products/{} - Cập nhật sản phẩm", productId);

        try {
            // Set product ID từ path parameter
            event.setProductId(productId);

            // Gọi Write Service
            var result = writeService.updateProduct(event);

            logger.info("✅ Sản phẩm đã cập nhật - ID: {}", result.getProductId());
            return ResponseEntity.ok(
                    new ApiResponse<>("Sản phẩm đã cập nhật thành công", result, 200));

        } catch (IllegalArgumentException e) {
            logger.error("❌ Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiErrorResponse(e.getMessage(), 400));

        } catch (RuntimeException e) {
            if (e.getMessage().contains("không tồn tại")) {
                logger.error("❌ Product not found: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiErrorResponse("Sản phẩm không tồn tại", 404));
            }
            logger.error("❌ Server error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Lỗi server: " + e.getMessage(), 500));
        }
    }

    /**
     * DELETE /api/products/{id}
     * 
     * Xóa sản phẩm
     * 
     * @param productId - ID của sản phẩm cần xóa
     * @return 200 OK - khi xóa thành công
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable("id") Long productId) {
        logger.info("🗑️ DELETE /api/products/{} - Xóa sản phẩm", productId);

        try {
            // Gọi Write Service
            writeService.deleteProduct(productId);

            logger.info("✅ Sản phẩm đã xóa - ID: {}", productId);
            return ResponseEntity.ok(
                    new ApiResponse<>("Sản phẩm đã xóa thành công", null, 200));

        } catch (RuntimeException e) {
            if (e.getMessage().contains("không tồn tại")) {
                logger.error("❌ Product not found: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiErrorResponse("Sản phẩm không tồn tại", 404));
            }
            logger.error("❌ Server error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Lỗi server: " + e.getMessage(), 500));
        }
    }

    // ============ READ ENDPOINTS (Query) ============
    // Tất cả các endpoint này đọc từ Redis - cực nhanh!

    /**
     * GET /api/products/{id}
     * 
     * Lấy thông tin chi tiết sản phẩm từ Redis
     * 
     * Performance: ~2-7ms (rất nhanh!)
     * 
     * @param productId - ID của sản phẩm
     * @return 200 OK - product detail
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable("id") Long productId) {
        logger.info("🔍 GET /api/products/{} - Lấy sản phẩm từ Redis", productId);

        try {
            // Gọi Query Service - đọc từ Redis
            ProductQueryService.ProductDetailDTO product = queryService.getProductDetails(productId);

            if (product != null) {
                logger.info("✅ Trả về product - ID: {}", productId);
                return ResponseEntity.ok(
                        new ApiResponse<>("Thành công", product, 200));
            } else {
                logger.warn("⚠️ Product không tìm thấy - ID: {}", productId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiErrorResponse("Sản phẩm không tồn tại", 404));
            }

        } catch (IllegalArgumentException e) {
            logger.error("❌ Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiErrorResponse(e.getMessage(), 400));

        } catch (Exception e) {
            logger.error("❌ Server error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Lỗi server: " + e.getMessage(), 500));
        }
    }

    /**
     * GET /api/products/{id}/price
     * 
     * Lấy giá sản phẩm từ Redis
     * 
     * Performance: ~2-7ms
     * 
     * @param productId - ID của sản phẩm
     * @return 200 OK - price
     */
    @GetMapping("/{id}/price")
    public ResponseEntity<?> getProductPrice(@PathVariable("id") Long productId) {
        logger.info("💰 GET /api/products/{}/price - Lấy giá từ Redis", productId);

        try {
            Double price = queryService.getProductPrice(productId);

            if (price != null) {
                logger.info("✅ Trả về giá - ID: {}", productId);
                return ResponseEntity.ok(
                        new ApiResponse<>("Thành công",
                                new PriceResponse(productId, price), 200));
            } else {
                logger.warn("⚠️ Sản phẩm không tìm thấy - ID: {}", productId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiErrorResponse("Sản phẩm không tồn tại", 404));
            }

        } catch (Exception e) {
            logger.error("❌ Server error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Lỗi server: " + e.getMessage(), 500));
        }
    }

    /**
     * GET /api/products/{id}/quantity
     * 
     * Lấy số lượng tồn sản phẩm từ Redis
     * 
     * Performance: ~2-7ms
     * 
     * @param productId - ID của sản phẩm
     * @return 200 OK - quantity
     */
    @GetMapping("/{id}/quantity")
    public ResponseEntity<?> getProductQuantity(@PathVariable("id") Long productId) {
        logger.info("📦 GET /api/products/{}/quantity - Lấy số lượng từ Redis", productId);

        try {
            Integer quantity = queryService.getProductQuantity(productId);

            if (quantity != null) {
                logger.info("✅ Trả về số lượng - ID: {}", productId);
                return ResponseEntity.ok(
                        new ApiResponse<>("Thành công",
                                new QuantityResponse(productId, quantity), 200));
            } else {
                logger.warn("⚠️ Sản phẩm không tìm thấy - ID: {}", productId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiErrorResponse("Sản phẩm không tồn tại", 404));
            }

        } catch (Exception e) {
            logger.error("❌ Server error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Lỗi server: " + e.getMessage(), 500));
        }
    }

    /**
     * GET /api/products/{id}/exists
     * 
     * Kiểm tra sản phẩm có tồn tại hay không
     * 
     * Performance: ~2-7ms
     * 
     * @param productId - ID của sản phẩm
     * @return 200 OK - exists (boolean)
     */
    @GetMapping("/{id}/exists")
    public ResponseEntity<?> checkProductExists(@PathVariable("id") Long productId) {
        logger.info("✅ GET /api/products/{}/exists - Kiểm tra tồn tại", productId);

        try {
            boolean exists = queryService.isProductExists(productId);
            logger.info("✅ Product exists: {}", exists);
            return ResponseEntity.ok(
                    new ApiResponse<>("Thành công",
                            new ExistsResponse(productId, exists), 200));

        } catch (Exception e) {
            logger.error("❌ Server error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Lỗi server: " + e.getMessage(), 500));
        }
    }

    // ============ RESPONSE MODELS ============

    /**
     * Generic API Response wrapper
     */
    public static class ApiResponse<T> {
        private String message;
        private T data;
        private int statusCode;

        public ApiResponse(String message, T data, int statusCode) {
            this.message = message;
            this.data = data;
            this.statusCode = statusCode;
        }

        public String getMessage() {
            return message;
        }

        public T getData() {
            return data;
        }

        public int getStatusCode() {
            return statusCode;
        }
    }

    /**
     * API Error Response
     */
    public static class ApiErrorResponse {
        private String error;
        private int statusCode;

        public ApiErrorResponse(String error, int statusCode) {
            this.error = error;
            this.statusCode = statusCode;
        }

        public String getError() {
            return error;
        }

        public int getStatusCode() {
            return statusCode;
        }
    }

    /**
     * Price Response DTO
     */
    public static class PriceResponse {
        private Long productId;
        private Double price;

        public PriceResponse(Long productId, Double price) {
            this.productId = productId;
            this.price = price;
        }

        public Long getProductId() {
            return productId;
        }

        public Double getPrice() {
            return price;
        }
    }

    /**
     * Quantity Response DTO
     */
    public static class QuantityResponse {
        private Long productId;
        private Integer quantity;

        public QuantityResponse(Long productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public Long getProductId() {
            return productId;
        }

        public Integer getQuantity() {
            return quantity;
        }
    }

    /**
     * Exists Response DTO
     */
    public static class ExistsResponse {
        private Long productId;
        private boolean exists;

        public ExistsResponse(Long productId, boolean exists) {
            this.productId = productId;
            this.exists = exists;
        }

        public Long getProductId() {
            return productId;
        }

        public boolean isExists() {
            return exists;
        }
    }
}
