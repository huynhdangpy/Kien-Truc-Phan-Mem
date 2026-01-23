package org.singleton_factory;

public class PostgreSQLDatabase implements Database {
    @Override
    public void connect() {
        System.out.println("Connect to PostgreSQL Database");
    }
}

