package iuh.fit.patterns.decorator;

import java.time.LocalDate;

/**
 * BrailleEditionDecorator - Sách có chữ nổi
 */
public class BrailleEditionDecorator extends BorrowDecorator {
    public BrailleEditionDecorator(BorrowComponent borrow) {
        super(borrow);
    }

    @Override
    public String getDescription() {
        return wrappedBorrow.getDescription() + " + Phiên bản chữ nổi (Braille)";
    }

    @Override
    public int getDurationInDays() {
        return wrappedBorrow.getDurationInDays();
    }

    @Override
    public double getCost() {
        return wrappedBorrow.getCost() + 50000; // 50,000 VND additional fee for braille edition
    }

    @Override
    public LocalDate getDueDate() {
        return wrappedBorrow.getDueDate();
    }
}
