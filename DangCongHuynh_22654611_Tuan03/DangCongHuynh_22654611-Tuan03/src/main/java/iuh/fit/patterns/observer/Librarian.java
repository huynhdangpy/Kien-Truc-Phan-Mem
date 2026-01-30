package iuh.fit.patterns.observer;

/**
 * Librarian - Nhân viên thư viện
 */
public class Librarian implements LibraryObserver {
    private String name;

    public Librarian(String name) {
        this.name = name;
    }

    @Override
    public void update(String notification) {
        System.out.println("[Librarian: " + name + "] Received notification: " + notification);
    }

    public String getName() {
        return name;
    }
}
