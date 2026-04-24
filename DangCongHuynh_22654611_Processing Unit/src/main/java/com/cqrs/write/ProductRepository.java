package com.cqrs.write;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA Repository - ProductRepository
 * 
 * Cung cấp các method CRUD cho ProductEntity:
 * - save(): Lưu/Cập nhật
 * - findById(): Tìm theo ID
 * - deleteById(): Xóa theo ID
 * - ... các method khác
 * 
 * Spring Data tự động tạo implement cho interface này
 * Không cần viết SQL raw query
 */
@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    /**
     * Tìm sản phẩm theo tên
     * 
     * @param productName - Tên sản phẩm cần tìm
     * @return Optional<ProductEntity>
     */
    Optional<ProductEntity> findByProductName(String productName);

    /**
     * Kiểm tra sản phẩm có tồn tại hay không
     * 
     * @param productName - Tên sản phẩm
     * @return true nếu tồn tại, false nếu không
     */
    boolean existsByProductName(String productName);
}
