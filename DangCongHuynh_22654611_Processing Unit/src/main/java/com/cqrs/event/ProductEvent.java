package com.cqrs.event;

import java.io.Serializable;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO - Data Transfer Object cho ProductEvent
 * 
 * Lớp này dùng để truyền tải sự kiện ghi/cập nhật sản phẩm
 * giữa các dịch vụ thông qua RabbitMQ message queue.
 * 
 * Đảm bảo tuân thủ nguyên tắc:
 * - Immutable (nếu có thể)
 * - Serializable cho RabbitMQ
 * - Có chứa đầy đủ thông tin cho cả Write-side và Read-side
 */
public class ProductEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("description")
    private String description;

    @JsonProperty("price")
    private Double price;

    @JsonProperty("quantity")
    private Integer quantity;

    @JsonProperty("event_type") // CREATE, UPDATE, DELETE
    private String eventType;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;

    @JsonProperty("source") // write-services
    private String source;

    /**
     * Constructor mặc định - cần thiết cho deserialize từ JSON
     */
    public ProductEvent() {
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructor đầy đủ tham số
     */
    public ProductEvent(Long productId, String productName, String description,
            Double price, Integer quantity, String eventType, String source) {
        this.productId = productId;
        this.productName = productName;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
        this.eventType = eventType;
        this.source = source;
        this.timestamp = LocalDateTime.now();
    }

    // ============ GETTERS & SETTERS ============

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

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    // ============ UTILITY METHODS ============

    @Override
    public String toString() {
        return "ProductEvent{" +
                "productId=" + productId +
                ", productName='" + productName + '\'' +
                ", price=" + price +
                ", quantity=" + quantity +
                ", eventType='" + eventType + '\'' +
                ", timestamp=" + timestamp +
                ", source='" + source + '\'' +
                '}';
    }
}
