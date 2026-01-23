package org.tax_strategy;


public class ConsumptionTax implements TaxStrategy {
    public double calculateTax(double price) {
        return price * 0.05;
    }
}

