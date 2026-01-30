package iuh.fit.patterns.singleton;

import iuh.fit.models.Book;
import iuh.fit.patterns.factory.BookFactory;
import iuh.fit.patterns.observer.LibraryObserver;
import iuh.fit.patterns.strategy.SearchStrategy;
import iuh.fit.patterns.strategy.SearchAvailableBooks;

import java.util.*;

/**
 * Singleton Pattern - Đảm bảo chỉ có một đối tượng Library duy nhất
 */
public class Library {
    private static Library instance;
    private List<Book> books;
    private List<LibraryObserver> observers;

    /**
     * Private constructor để ngăn chặn tạo nhiều instance
     */
    private Library() {
        this.books = new ArrayList<>();
        this.observers = new ArrayList<>();
    }

    /**
     * Singleton getInstance method
     */
    public static synchronized Library getInstance() {
        if (instance == null) {
            instance = new Library();
        }
        return instance;
    }

    // Observer Pattern Methods
    public void subscribe(LibraryObserver observer) {
        observers.add(observer);
        System.out.println("✓ Observer subscribed: " + observer.getClass().getSimpleName());
    }

    public void unsubscribe(LibraryObserver observer) {
        observers.remove(observer);
        System.out.println("✓ Observer unsubscribed: " + observer.getClass().getSimpleName());
    }

    public void notifyObservers(String notification) {
        for (LibraryObserver observer : observers) {
            observer.update(notification);
        }
    }

    // Book Management Methods
    /**
     * Thêm sách mới vào thư viện (sử dụng Factory Pattern)
     */
    public void addBook(String bookType, String id, String title, String author, String category) {
        try {
            BookFactory factory = BookFactory.getFactory(bookType);
            Book book = factory.createBook(id, title, author, category);
            books.add(book);
            System.out.println("✓ New book added: " + title);
            notifyObservers("Sách mới đã được thêm vào thư viện: " + title + " (" + book.getBookType() + ")");
        } catch (IllegalArgumentException e) {
            System.out.println("✗ Error adding book: " + e.getMessage());
        }
    }

    /**
     * Mượn sách
     */
    public boolean borrowBook(String bookId) {
        for (Book book : books) {
            if (book.getId().equals(bookId)) {
                if (book.isAvailable()) {
                    book.setAvailable(false);
                    System.out.println("✓ Book borrowed successfully: " + book.getTitle());
                    notifyObservers("Sách '" + book.getTitle() + "' đã được mượn. Thời gian hạn: 14 ngày");
                    return true;
                } else {
                    System.out.println("✗ Book is not available: " + book.getTitle());
                    return false;
                }
            }
        }
        System.out.println("✗ Book not found with ID: " + bookId);
        return false;
    }

    /**
     * Trả sách
     */
    public boolean returnBook(String bookId) {
        for (Book book : books) {
            if (book.getId().equals(bookId)) {
                if (!book.isAvailable()) {
                    book.setAvailable(true);
                    System.out.println("✓ Book returned successfully: " + book.getTitle());
                    notifyObservers("Sách '" + book.getTitle() + "' đã được trả");
                    return true;
                } else {
                    System.out.println("✗ Book is already available: " + book.getTitle());
                    return false;
                }
            }
        }
        System.out.println("✗ Book not found with ID: " + bookId);
        return false;
    }

    /**
     * Tìm kiếm sách (sử dụng Strategy Pattern)
     */
    public List<Book> searchBooks(SearchStrategy strategy, String query) {
        return strategy.search(books, query);
    }

    /**
     * Lấy danh sách tất cả sách
     */
    public List<Book> getAllBooks() {
        return new ArrayList<>(books);
    }

    /**
     * Lấy danh sách sách có sẵn
     */
    public List<Book> getAvailableBooks() {
        SearchStrategy strategy = new SearchAvailableBooks();
        return strategy.search(books, "");
    }

    /**
     * Lấy sách theo ID
     */
    public Book getBookById(String id) {
        for (Book book : books) {
            if (book.getId().equals(id)) {
                return book;
            }
        }
        return null;
    }

    /**
     * Xóa sách khỏi thư viện
     */
    public boolean removeBook(String bookId) {
        for (int i = 0; i < books.size(); i++) {
            if (books.get(i).getId().equals(bookId)) {
                Book removedBook = books.remove(i);
                System.out.println("✓ Book removed: " + removedBook.getTitle());
                notifyObservers("Sách '" + removedBook.getTitle() + "' đã bị xóa khỏi thư viện");
                return true;
            }
        }
        System.out.println("✗ Book not found with ID: " + bookId);
        return false;
    }

    /**
     * Hiển thị thống kê thư viện
     */
    public void displayStatistics() {
        int totalBooks = books.size();
        int availableBooks = (int) books.stream().filter(Book::isAvailable).count();
        int borrowedBooks = totalBooks - availableBooks;

        System.out.println("\n" + "=".repeat(50));
        System.out.println("📚 THỐNG KÊ THƯ VIỆN");
        System.out.println("=".repeat(50));
        System.out.println("Tổng số sách: " + totalBooks);
        System.out.println("Sách có sẵn: " + availableBooks);
        System.out.println("Sách đang mượn: " + borrowedBooks);
        System.out.println("=".repeat(50) + "\n");
    }

    /**
     * Hiển thị tất cả sách
     */
    public void displayAllBooks() {
        if (books.isEmpty()) {
            System.out.println("Thư viện trống!");
            return;
        }
        System.out.println("\n" + "=".repeat(100));
        System.out.println("📖 DANH SÁCH TẤT CẢ SÁCH");
        System.out.println("=".repeat(100));
        for (Book book : books) {
            String status = book.isAvailable() ? "✓ Có sẵn" : "✗ Đang mượn";
            System.out.println(book + " [" + status + "]");
        }
        System.out.println("=".repeat(100) + "\n");
    }
}
