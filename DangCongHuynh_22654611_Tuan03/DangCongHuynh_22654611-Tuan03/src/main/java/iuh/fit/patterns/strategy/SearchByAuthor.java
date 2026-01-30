package iuh.fit.patterns.strategy;

import iuh.fit.models.Book;
import java.util.ArrayList;
import java.util.List;

/**
 * Tìm kiếm theo tác giả
 */
public class SearchByAuthor implements SearchStrategy {
    @Override
    public List<Book> search(List<Book> books, String query) {
        List<Book> results = new ArrayList<>();
        for (Book book : books) {
            if (book.getAuthor().toLowerCase().contains(query.toLowerCase())) {
                results.add(book);
            }
        }
        System.out.println("Searching by Author: '" + query + "' - Found " + results.size() + " result(s)");
        return results;
    }
}
