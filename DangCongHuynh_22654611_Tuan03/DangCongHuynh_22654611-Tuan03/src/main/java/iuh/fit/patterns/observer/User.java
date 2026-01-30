package iuh.fit.patterns.observer;

/**
 * User - Người dùng đăng ký theo dõi
 */
public class User implements LibraryObserver {
    private String name;
    private String email;

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    @Override
    public void update(String notification) {
        System.out.println("[User: " + name + " (" + email + ")] Received notification: " + notification);
    }

    public String getName() {
        return name;
    }
}
