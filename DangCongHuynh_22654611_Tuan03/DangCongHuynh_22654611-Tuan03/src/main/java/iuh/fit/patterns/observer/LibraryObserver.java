package iuh.fit.patterns.observer;

/**
 * Observer Pattern - Interface cho những người quan tâm (subscribers)
 */
public interface LibraryObserver {
    void update(String notification);
}
