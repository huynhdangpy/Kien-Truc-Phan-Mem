package org.tax_strategy;

public class LuxuryTax implements TaxStrategy {
    public double calculateTax(double price) {
        return price * 0.20;
    }
}

