package iuh.fit.models;

/**
 * AudioBook - Sách nói
 */
public class AudioBook extends Book {
    private String narrator;
    private double durationInHours;

    public AudioBook(String id, String title, String author, String category, String narrator, double durationInHours) {
        super(id, title, author, category);
        this.narrator = narrator;
        this.durationInHours = durationInHours;
    }

    public String getNarrator() {
        return narrator;
    }

    public double getDurationInHours() {
        return durationInHours;
    }

    @Override
    public String getBookType() {
        return "Sách nói (AudioBook)";
    }
}
