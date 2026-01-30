package iuh.fit.patterns.decorator;

import java.time.LocalDate; /**
 * BaseBorrow - Mượn cơ bản
 */
public class BaseBorrow extends BorrowComponent {
    private static final int DEFAULT_DURATION = 14; // 2 tuần
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private String bookTitle;

    public BaseBorrow(String bookTitle) {
        this.bookTitle = bookTitle;
        this.borrowDate = LocalDate.now();
        this.dueDate = borrowDate.plusDays(DEFAULT_DURATION);
    }

    @Override
    public String getDescription() {
        return "Mượn sách: " + bookTitle + " (Mặc định 14 ngày)";
    }

    @Override
    public int getDurationInDays() {
        return DEFAULT_DURATION;
    }

    @Override
    public double getCost() {
        return 0.0; // Miễn phí mượn cơ bản
    }

    @Override
    public LocalDate getDueDate() {
        return dueDate;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public LocalDate getBorrowDate() {
        return borrowDate;
    }
}
