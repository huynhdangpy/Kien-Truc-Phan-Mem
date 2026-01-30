package iuh.fit.patterns.strategy;

import iuh.fit.models.Book;
import java.util.List;

/**
 * Strategy Pattern - Interface cho các chiến lược tìm kiếm
 */
public interface SearchStrategy {
    List<Book> search(List<Book> books, String query);
}
