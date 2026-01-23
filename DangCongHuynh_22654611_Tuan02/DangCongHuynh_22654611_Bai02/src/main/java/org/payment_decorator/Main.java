package org.payment_decorator;

public class Main {
    public static void main(String[] args) {

        Payment payment =
                new DiscountDecorator(
                        new FeeDecorator(
                                new BasicPayment()
                        )
                );

        double total = payment.pay(100);
        System.out.println("Tổng tiền phải trả: " + total);
    }
}

