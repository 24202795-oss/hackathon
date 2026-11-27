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

        // 6. Test the User class: create a user and check login
        User u1 = new User("ali", "pass123", "Ali bin Ahmad");

        System.out.println("----- USER -----");
        u1.displayDetails();

        System.out.println("\nLogin with wrong password: " + u1.login("wrong"));
        System.out.println("Login with correct password: " + u1.login("pass123"));

        // 7. Test the Admin class: it IS-A User, plus category management
        Admin a1 = new Admin("admin1", "adminpw", "System Administrator");

        System.out.println("\n----- ADMIN -----");
        a1.displayDetails();

        String[] categories = new String[10];
        int categoryCount = 0;

        if (a1.addCategory(categories, categoryCount, "Food")) {
            categoryCount++;
        }
        a1.addCategory(categories, categoryCount, "Transport");
        categoryCount++;
        a1.addCategory(categories, categoryCount, "Shopping");
        categoryCount++;

        a1.viewCategories(categories, categoryCount);

        // 8. Polymorphism again: an Admin can be stored as a User,
        //    and the Admin version of displayDetails() runs
        User[] people = new User[2];
        people[0] = u1;
        people[1] = a1;

        System.out.println("\n----- ALL USERS (polymorphism) -----");
        for (int i = 0; i < people.length; i++) {
            people[i].displayDetails();
        }

        // 9. Test Category: one with description, one without
        Category c1 = new Category("Food", "Meals, snacks and drinks");
        Category c2 = new Category("Entertainment");

        System.out.println("\n----- CATEGORIES -----");
        c1.displayDetails();
        c2.displayDetails();

        // 10. Test Budget: RM300 food budget, record RM250 spending
        Budget b1 = new Budget("Food", 300);

        System.out.println("\n----- BUDGET (spent RM250 of RM300 = 83%) -----");
        b1.addSpending(250);
        b1.displayDetails();

        // Also check the exceeded status
        b1.addSpending(100);
        System.out.println("\n----- SAME BUDGET AFTER RM100 MORE -----");
        b1.displayDetails();

        // 11. Test SavingsGoal: Laptop RM2000 target, add RM800
        SavingsGoal g1 = new SavingsGoal("Laptop", 2000);

        System.out.println("\n----- SAVINGS GOAL -----");
        g1.addSavings(800);
        g1.displayDetails();

        // Business rule: negative savings must be rejected
        System.out.println("\nAdd negative savings (-50): " + g1.addSavings(-50));

        // Finish the goal
        g1.addSavings(1200);
        System.out.println("\n----- GOAL AFTER FULLY SAVED -----");
        g1.displayDetails();

        // ============================================================
        // 12. Test FinanceManager: the full workflow through one manager
        // ============================================================
        FinanceManager fm = new FinanceManager();

        // Admin sets up categories through the manager
        fm.addCategory("Food");
        fm.addCategory("Transport");
        fm.addCategory("Shopping");

        System.out.println("\n----- FINANCE MANAGER TEST -----");

        // Add income (validated)
        Income salary = new Income("01/11/2026", "Part-time salary", 1000.00, "Cafe job");
        System.out.println("Add income RM1000: " + fm.addIncome(salary));
        System.out.println("Add income RM-50 (invalid): " + fm.addIncome(new Income("01/11/2026", "Bad", -50, "Test")));

        // Add expenses (category must be valid)
        System.out.println("Add expense Food RM250: " + fm.addExpense(new Expense("05/11/2026", "Groceries", 250.00, "Food")));
        System.out.println("Add expense with INVALID category: " + fm.addExpense(new Expense("05/11/2026", "Ticket", 30.00, "Holiday")));

        // Search expense by keyword
        Expense found = fm.searchExpenseByDescription("grocer");
        System.out.println("Search 'grocer' found: " + found.getDescription() + " RM" + found.getAmount());

        // Update expense amount
        System.out.println("Update expense to RM300: " + fm.updateExpenseAmount(0, 300.00));

        // Set budget AFTER expense existed: budget shows current spending
        fm.setBudget("Food", 400);
        System.out.println("\nFood budget status:");
        fm.findBudget("Food").displayDetails();

        // Savings goal through the manager
        fm.addGoal(new SavingsGoal("Emergency fund", 1000));
        System.out.println("\nAdd RM200 to Emergency fund: " + fm.addToGoal("Emergency fund", 200));

        // Totals and balance (calculated from real records)
        System.out.println("\n----- SUMMARY -----");
        System.out.println("Total income: RM" + fm.getTotalIncome());
        System.out.println("Total expenses: RM" + fm.getTotalExpenses());
        System.out.println("Balance: RM" + fm.getBalance());
        System.out.println("Total saved in goals: RM" + fm.getTotalSaved());

        // Delete the expense, budget and totals must update
        System.out.println("\nDelete expense: " + fm.deleteExpense(0));
        System.out.println("After delete - total expenses: RM" + fm.getTotalExpenses()
                + ", Food budget spent: RM" + fm.findBudget("Food").getSpent());
    }
}
