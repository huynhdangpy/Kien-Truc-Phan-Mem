package iuh.fit.patterns.decorator;

import java.time.LocalDate;

/**
 * Decorator Pattern - Thành phần cơ bản: Borrow (Mượn sách)
 */
public abstract class BorrowComponent {
    public abstract String getDescription();

    public abstract int getDurationInDays();

    public abstract double getCost();

    public abstract LocalDate getDueDate();
}
