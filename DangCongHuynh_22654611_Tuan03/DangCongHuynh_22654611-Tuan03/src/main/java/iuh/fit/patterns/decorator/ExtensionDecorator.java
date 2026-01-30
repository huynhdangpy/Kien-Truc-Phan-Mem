package iuh.fit.patterns.decorator;

import java.time.LocalDate;

/**
 * ExtensionDecorator - Gia hạn thời gian mượn thêm
 */
public class ExtensionDecorator extends BorrowDecorator {
    private int extensionDays;

    public ExtensionDecorator(BorrowComponent borrow, int extensionDays) {
        super(borrow);
        this.extensionDays = extensionDays;
    }

    @Override
    public String getDescription() {
        return wrappedBorrow.getDescription() + " + Gia hạn " + extensionDays + " ngày";
    }

    @Override
    public int getDurationInDays() {
        return wrappedBorrow.getDurationInDays() + extensionDays;
    }

    @Override
    public double getCost() {
        return wrappedBorrow.getCost() + (extensionDays * 2000); // 2000 VND per extension day
    }

    @Override
    public LocalDate getDueDate() {
        return wrappedBorrow.getDueDate().plusDays(extensionDays);
    }
}
