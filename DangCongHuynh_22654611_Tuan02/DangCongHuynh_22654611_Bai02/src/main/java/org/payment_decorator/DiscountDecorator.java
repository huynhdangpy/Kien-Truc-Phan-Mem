package org.payment_decorator;

public class DiscountDecorator extends PaymentDecorator {

    public DiscountDecorator(Payment payment) {
        super(payment);
    }

    public double pay(double amount) {
        double result = payment.pay(amount);
        System.out.println("Giảm giá: 10");
        return result - 10;
    }
}

