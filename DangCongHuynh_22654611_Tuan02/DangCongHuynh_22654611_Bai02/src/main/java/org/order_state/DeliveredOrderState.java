package org.order_state;

public class DeliveredOrderState implements OrderState {
    public void handle() {
        System.out.println("Đã giao: Cập nhật trạng thái đơn hàng là đã giao");
    }
}

