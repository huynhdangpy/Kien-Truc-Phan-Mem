package org.order_state;


public class CancelledOrderState implements OrderState {
    public void handle() {
        System.out.println("Hủy: Hủy đơn hàng và hoàn tiền");
    }
}

