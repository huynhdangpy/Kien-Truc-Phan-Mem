package org.order_state;

public class Order {
    private OrderState state;

    public void setState(OrderState state) {
        this.state = state;
    }

    public void process() {
        state.handle();
    }
}


