package org.order_state;
public class ProcessingOrderState implements OrderState {
    public void handle() {
        System.out.println("Đang xử lý: Đóng gói và vận chuyển");
    }
}

