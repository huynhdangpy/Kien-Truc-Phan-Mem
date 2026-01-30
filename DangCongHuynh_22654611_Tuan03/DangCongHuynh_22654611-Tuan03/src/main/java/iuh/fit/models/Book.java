package iuh.fit.models;

import java.time.LocalDate;

/**
 * Book class representing a book in the library system
 */
public abstract class Book {
    protected String id;
    protected String title;
    protected String author;
    protected String category;
    protected boolean isAvailable;
    protected LocalDate dateAdded;

    public Book(String id, String title, String author, String category) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.isAvailable = true;
        this.dateAdded = LocalDate.now();
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getCategory() {
        return category;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public LocalDate getDateAdded() {
        return dateAdded;
    }

    public abstract String getBookType();

    @Override
    public String toString() {
        return "Book{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", category='" + category + '\'' +
                ", type=" + getBookType() +
                ", available=" + isAvailable +
                '}';
    }
}
