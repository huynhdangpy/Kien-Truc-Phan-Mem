package org.singleton_factory;

public class DatabaseFactory {
    public static Database createDatabase(String type) {
        if (type.equalsIgnoreCase("mysql")) {
            return new MySQLDatabase();
        } else if (type.equalsIgnoreCase("postgres")) {
            return new PostgreSQLDatabase();
        }
        return null;
    }
}
