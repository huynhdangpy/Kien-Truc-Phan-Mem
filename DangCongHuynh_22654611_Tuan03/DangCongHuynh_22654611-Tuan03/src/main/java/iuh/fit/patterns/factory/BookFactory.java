package iuh.fit.patterns.factory;

import iuh.fit.models.*;

/**
 * Factory Method Pattern - Tạo các loại sách khác nhau
 */
public abstract class BookFactory {
    public abstract Book createBook(String id, String title, String author, String category);

    /**
     * Static factory method để lấy BookFactory dựa trên loại sách
     */
    public static BookFactory getFactory(String bookType) {
        switch (bookType.toLowerCase()) {
            case "paperbook":
            case "sách giấy":
                return new PaperBookFactory();
            case "ebook":
            case "sách điện tử":
                return new EBookFactory();
            case "audiobook":
            case "sách nói":
                return new AudioBookFactory();
            default:
                throw new IllegalArgumentException("Unknown book type: " + bookType);
        }
    }
}

/**
 * PaperBookFactory - Tạo sách giấy
 */
class PaperBookFactory extends BookFactory {
    @Override
    public Book createBook(String id, String title, String author, String category) {
        return new PaperBook(id, title, author, category, 300); // Default page count
    }
}

/**
 * EBookFactory - Tạo sách điện tử
 */
class EBookFactory extends BookFactory {
    @Override
    public Book createBook(String id, String title, String author, String category) {
        return new EBook(id, title, author, category, "PDF", 5); // Default format and size
    }
}

/**
 * AudioBookFactory - Tạo sách nói
 */
class AudioBookFactory extends BookFactory {
    @Override
    public Book createBook(String id, String title, String author, String category) {
        return new AudioBook(id, title, author, category, "Unknown Narrator", 10.0); // Default narrator and duration
    }
}
