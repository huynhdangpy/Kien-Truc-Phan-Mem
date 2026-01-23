package org.payment_decorator;

public class FeeDecorator extends PaymentDecorator {

    public FeeDecorator(Payment payment) {
        super(payment);
    }

    public double pay(double amount) {
        double result = payment.pay(amount);
        System.out.println("Cộng phí xử lý: 5");
        return result + 5;
    }
}

