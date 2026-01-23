package org.singleton_factory;


public class Main {
    public static void main(String[] args) {

        DatabaseConnection c1 = DatabaseConnection.getInstance();
        DatabaseConnection c2 = DatabaseConnection.getInstance();

        System.out.println(c1 == c2); // true

        Database db = DatabaseFactory.createDatabase("mysql");
        db.connect();
    }
}

