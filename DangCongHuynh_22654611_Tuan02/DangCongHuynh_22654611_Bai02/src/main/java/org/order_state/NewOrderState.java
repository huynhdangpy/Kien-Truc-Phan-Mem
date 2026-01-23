package org.order_state;

public class NewOrderState implements OrderState {
    public void handle() {
        System.out.println("Mới tạo: Kiểm tra thông tin đơn hàng");
    }
}

