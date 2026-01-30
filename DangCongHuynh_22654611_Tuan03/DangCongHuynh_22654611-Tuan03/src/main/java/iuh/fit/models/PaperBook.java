package iuh.fit.models;

/**
 * PaperBook - Sách in giấy
 */
public class PaperBook extends Book {
    private int pageCount;

    public PaperBook(String id, String title, String author, String category, int pageCount) {
        super(id, title, author, category);
        this.pageCount = pageCount;
    }

    public int getPageCount() {
        return pageCount;
    }

    @Override
    public String getBookType() {
        return "Sách giấy (Paper Book)";
    }
}
