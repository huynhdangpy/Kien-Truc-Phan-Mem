package org.tax_strategy;


public class TaxCalculator {
    private TaxStrategy strategy;

    public void setStrategy(TaxStrategy strategy) {
        this.strategy = strategy;
    }

    public double calculate(double price) {
        return strategy.calculateTax(price);
    }
}

