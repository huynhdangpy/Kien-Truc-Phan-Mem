package iuh.fit.models;

/**
 * EBook - Sách điện tử
 */
public class EBook extends Book {
    private String fileFormat; // PDF, EPUB, MOBI, etc.
    private long fileSizeInMB;

    public EBook(String id, String title, String author, String category, String fileFormat, long fileSizeInMB) {
        super(id, title, author, category);
        this.fileFormat = fileFormat;
        this.fileSizeInMB = fileSizeInMB;
    }

    public String getFileFormat() {
        return fileFormat;
    }

    public long getFileSizeInMB() {
        return fileSizeInMB;
    }

    @Override
    public String getBookType() {
        return "Sách điện tử (EBook)";
    }
}
