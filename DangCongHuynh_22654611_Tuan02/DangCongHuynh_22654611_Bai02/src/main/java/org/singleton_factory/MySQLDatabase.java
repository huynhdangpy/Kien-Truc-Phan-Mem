package org.singleton_factory;

public class MySQLDatabase implements Database {
    @Override
    public void connect() {
        System.out.println("Connect to MySQL Database");
    }
}