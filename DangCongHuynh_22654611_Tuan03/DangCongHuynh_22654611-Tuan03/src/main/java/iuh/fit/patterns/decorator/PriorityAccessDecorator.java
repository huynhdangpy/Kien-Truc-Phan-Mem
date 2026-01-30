package iuh.fit.patterns.decorator;

import java.time.LocalDate;

/**
 * PriorityAccessDecorator - Truy cập ưu tiên
 */
public class PriorityAccessDecorator extends BorrowDecorator {
    public PriorityAccessDecorator(BorrowComponent borrow) {
        super(borrow);
    }

    @Override
    public String getDescription() {
        return wrappedBorrow.getDescription() + " + Truy cập ưu tiên";
    }

    @Override
    public int getDurationInDays() {
        return wrappedBorrow.getDurationInDays();
    }

    @Override
    public double getCost() {
        return wrappedBorrow.getCost() + 20000; // 20,000 VND for priority access
    }

    @Override
    public LocalDate getDueDate() {
        return wrappedBorrow.getDueDate();
    }
}
