package iuh.fit.patterns.decorator;

/**
 * BorrowDecorator - Abstract decorator
 */
public abstract class BorrowDecorator extends BorrowComponent {
    protected BorrowComponent wrappedBorrow;

    public BorrowDecorator(BorrowComponent borrow) {
        this.wrappedBorrow = borrow;
    }
}
