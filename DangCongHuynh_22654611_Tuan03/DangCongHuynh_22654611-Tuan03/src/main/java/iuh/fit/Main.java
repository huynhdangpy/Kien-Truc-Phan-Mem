package iuh.fit;

import iuh.fit.patterns.singleton.Library;
import iuh.fit.patterns.observer.Librarian;
import iuh.fit.patterns.observer.User;
import iuh.fit.patterns.strategy.*;
import iuh.fit.patterns.decorator.*;

/**
 * Demo Application - Library Management System
 * Demonstrates all 5 Design Patterns
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("\n╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║   HỆ THỐNG QUẢN LÝ THƯ VIỆN - LIBRARY MANAGEMENT SYSTEM        ║");
        System.out.println("║   Sử dụng 5 Design Patterns                                    ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");

        // ========== SINGLETON PATTERN: Lấy instance thư viện duy nhất ==========
        System.out.println("\n[1] SINGLETON PATTERN - Tạo thư viện duy nhất");
        System.out.println("─".repeat(50));
        Library library = Library.getInstance();
        Library library2 = Library.getInstance();
        System.out.println("library == library2: " + (library == library2) + " (Cùng một instance)");

        // ========== OBSERVER PATTERN: Đăng ký Observer ==========
        System.out.println("\n[2] OBSERVER PATTERN - Đăng ký theo dõi");
        System.out.println("─".repeat(50));
        Librarian librarian1 = new Librarian("Nguyễn Văn A");
        Librarian librarian2 = new Librarian("Trần Thị B");
        User user1 = new User("Lê Văn C", "lvc@gmail.com");
        User user2 = new User("Phạm Thị D", "ptd@gmail.com");

        library.subscribe(librarian1);
        library.subscribe(librarian2);
        library.subscribe(user1);
        library.subscribe(user2);

        // ========== FACTORY METHOD PATTERN: Thêm sách ==========
        System.out.println("\n[3] FACTORY METHOD PATTERN - Tạo các loại sách khác nhau");
        System.out.println("─".repeat(50));

        library.addBook("paperbook", "B001", "Lập Trình Java", "Tran Anh Tuan", "Công Nghệ");
        library.addBook("paperbook", "B002", "Thiết Kế Phần Mềm", "Dang Cong Huynh", "Công Nghệ");
        library.addBook("ebook", "B003", "Clean Code", "Robert C. Martin", "Công Nghệ");
        library.addBook("ebook", "B004", "Design Patterns", "Gang of Four", "Công Nghệ");
        library.addBook("audiobook", "B005", "Đắc Nhân Tâm", "Dale Carnegie", "Tâm Lý Học");
        library.addBook("audiobook", "B006", "Thói Quen Tuyệt Vời", "BJ Fogg", "Tâm Lý Học");
        library.addBook("paperbook", "B007", "Tiểu Thuyết Doremon", "Fujiko F Fujio", "Truyện Tranh");

        // Display all books
        library.displayStatistics();
        library.displayAllBooks();

        // ========== STRATEGY PATTERN: Tìm kiếm sách ==========
        System.out.println("\n[4] STRATEGY PATTERN - Tìm kiếm với các chiến lược khác nhau");
        System.out.println("─".repeat(50));

        System.out.println("\n--- Tìm kiếm theo tên (SearchByTitle) ---");
        SearchStrategy titleSearch = new SearchByTitle();
        library.searchBooks(titleSearch, "Java").forEach(System.out::println);

        System.out.println("\n--- Tìm kiếm theo tác giả (SearchByAuthor) ---");
        SearchStrategy authorSearch = new SearchByAuthor();
        library.searchBooks(authorSearch, "Trần").forEach(System.out::println);

        System.out.println("\n--- Tìm kiếm theo thể loại (SearchByCategory) ---");
        SearchStrategy categorySearch = new SearchByCategory();
        library.searchBooks(categorySearch, "Công Nghệ").forEach(System.out::println);

        // ========== Borrow & Return Books ==========
        System.out.println("\n[5] MƯỢN VÀ TRẢ SÁCH");
        System.out.println("─".repeat(50));

        System.out.println("\n--- Mượn sách ---");
        library.borrowBook("B001");
        library.borrowBook("B003");
        library.borrowBook("B005");

        System.out.println("\n--- Cố gắng mượn sách đã được mượn ---");
        library.borrowBook("B001");

        library.displayStatistics();

        System.out.println("\n--- Trả sách ---");
        library.returnBook("B001");

        library.displayStatistics();

        // ========== DECORATOR PATTERN: Mượn sách với các tính năng bổ sung ==========
        System.out.println("\n[6] DECORATOR PATTERN - Mượn sách với các tính năng bổ sung");
        System.out.println("─".repeat(50));

        System.out.println("\n--- Mượn cơ bản ---");
        BorrowComponent baseBorrow = new BaseBorrow("Lập Trình Java");
        System.out.println("Mô tả: " + baseBorrow.getDescription());
        System.out.println("Thời gian mượn: " + baseBorrow.getDurationInDays() + " ngày");
        System.out.println("Phí: " + baseBorrow.getCost() + " VND");
        System.out.println("Hạn trả: " + baseBorrow.getDueDate());

        System.out.println("\n--- Mượn + Gia hạn 7 ngày ---");
        BorrowComponent borrowWithExtension = new ExtensionDecorator(baseBorrow, 7);
        System.out.println("Mô tả: " + borrowWithExtension.getDescription());
        System.out.println("Thời gian mượn: " + borrowWithExtension.getDurationInDays() + " ngày");
        System.out.println("Phí: " + borrowWithExtension.getCost() + " VND");
        System.out.println("Hạn trả: " + borrowWithExtension.getDueDate());

        System.out.println("\n--- Mượn + Gia hạn + Phiên bản chữ nổi ---");
        BorrowComponent borrowWithBraille = new BrailleEditionDecorator(borrowWithExtension);
        System.out.println("Mô tả: " + borrowWithBraille.getDescription());
        System.out.println("Thời gian mượn: " + borrowWithBraille.getDurationInDays() + " ngày");
        System.out.println("Phí: " + borrowWithBraille.getCost() + " VND");
        System.out.println("Hạn trả: " + borrowWithBraille.getDueDate());

        System.out.println("\n--- Mượn + Gia hạn + Bản dịch tiếng Anh + Truy cập ưu tiên ---");
        BorrowComponent complexBorrow = new PriorityAccessDecorator(
                new TranslationEditionDecorator(
                        new ExtensionDecorator(baseBorrow, 14),
                        "English"));
        System.out.println("Mô tả: " + complexBorrow.getDescription());
        System.out.println("Thời gian mượn: " + complexBorrow.getDurationInDays() + " ngày");
        System.out.println("Phí: " + complexBorrow.getCost() + " VND");
        System.out.println("Hạn trả: " + complexBorrow.getDueDate());

        // ========== Sách lưu trữ sẵn có ==========
        System.out.println("\n[7] SỰ KIỆN THÊM MỚI");
        System.out.println("─".repeat(50));
        library.addBook("paperbook", "B008", "Harry Potter", "J.K. Rowling", "Tiểu Thuyết");

        System.out.println("\n" + "=".repeat(70));
        System.out.println("✅ DEMO HOÀN TẤT - Tất cả 5 Design Patterns đã được giới thiệu");
        System.out.println("=".repeat(70) + "\n");
    }
}