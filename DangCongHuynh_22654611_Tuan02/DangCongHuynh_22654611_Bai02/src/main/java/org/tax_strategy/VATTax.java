package org.tax_strategy;


public class VATTax implements TaxStrategy {
    public double calculateTax(double price) {
        return price * 0.10;
    }
}

