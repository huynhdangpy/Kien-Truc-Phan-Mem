package iuh.fit.patterns.strategy;

import iuh.fit.models.Book;
import java.util.ArrayList;
import java.util.List;

/**
 * Tìm kiếm sách có sẵn
 */
public class SearchAvailableBooks implements SearchStrategy {
    @Override
    public List<Book> search(List<Book> books, String query) {
        List<Book> results = new ArrayList<>();
        for (Book book : books) {
            if (book.isAvailable()) {
                results.add(book);
            }
        }
        System.out.println("Searching available books - Found " + results.size() + " result(s)");
        return results;
    }
}
