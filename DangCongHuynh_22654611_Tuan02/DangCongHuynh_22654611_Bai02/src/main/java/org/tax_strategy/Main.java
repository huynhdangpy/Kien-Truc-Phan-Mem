package org.tax_strategy;

public class Main {
    public static void main(String[] args) {

        TaxCalculator calculator = new TaxCalculator();

        calculator.setStrategy(new VATTax());
        System.out.println("VAT Tax: " + calculator.calculate(1000));

        calculator.setStrategy(new LuxuryTax());
        System.out.println("Luxury Tax: " + calculator.calculate(1000));
    }
}

