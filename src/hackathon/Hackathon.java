package hackathon;

/**
 * Test program for Stage 3, Part 2:
 * demonstrates Transaction, and the child classes Income and Expense.
 *
 * @author USER
 */
public class Hackathon {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {

        // 1. Create a plain Transaction object (the parent class)
        Transaction t1 = new Transaction("26/11/2026", "Lunch", 15.00);

        System.out.println("----- TRANSACTION -----");
        t1.displayDetails();

        // 2. Create an Income object (child class, has extra "source")
        Income i1 = new Income("26/11/2026", "Monthly allowance", 1000.00, "Parents");

        System.out.println("\n----- INCOME -----");
        i1.displayDetails();

        // 3. Create an Expense object (child class, has extra "category")
        Expense e1 = new Expense("26/11/2026", "Bus ticket", 3.00, "Transport");

        System.out.println("\n----- EXPENSE -----");
        e1.displayDetails();

        // 4. Use a setter to change a value, then display again
        e1.setAmount(4.50);

        System.out.println("\n----- EXPENSE AFTER UPDATE -----");
        e1.displayDetails();

        // 5. Show inheritance: one Transaction array can hold
        //    Income AND Expense objects together.
        Transaction[] records = new Transaction[2];
        records[0] = i1;
        records[1] = e1;

        System.out.println("\n----- ALL RECORDS (polymorphism) -----");
        for (int i = 0; i < records.length; i++) {
            records[i].displayDetails();
            System.out.println();
        }
    }
}
