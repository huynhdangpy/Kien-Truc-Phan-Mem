package iuh.fit.patterns.decorator;

import java.time.LocalDate;

/**
 * TranslationEditionDecorator - Sách có bản dịch
 */
public class TranslationEditionDecorator extends BorrowDecorator {
    private String translationLanguage;

    public TranslationEditionDecorator(BorrowComponent borrow, String translationLanguage) {
        super(borrow);
        this.translationLanguage = translationLanguage;
    }

    @Override
    public String getDescription() {
        return wrappedBorrow.getDescription() + " + Bản dịch sang " + translationLanguage;
    }

    @Override
    public int getDurationInDays() {
        return wrappedBorrow.getDurationInDays();
    }

    @Override
    public double getCost() {
        return wrappedBorrow.getCost() + 30000; // 30,000 VND additional fee for translation
    }

    @Override
    public LocalDate getDueDate() {
        return wrappedBorrow.getDueDate();
    }
}
