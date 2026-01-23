package org.order_state;
public class Main {
    public static void main(String[] args) {
        Order order = new Order();

        order.setState(new NewOrderState());
        order.process();

        order.setState(new ProcessingOrderState());
        order.process();

        order.setState(new DeliveredOrderState());
        order.process();

        order.setState(new CancelledOrderState());
        order.process();
    }
}


