package org.payment_decorator;

public class BasicPayment implements Payment {
    public double pay(double amount) {
        System.out.println("Thanh toán cơ bản");
        return amount;
    }
}

