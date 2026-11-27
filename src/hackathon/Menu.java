package hackathon;

import java.util.Scanner;

/**
 * Displays all menus and processes user selections.
 * The only class that talks to the user through the console.
 *
 * Flow (plan section 5):
 *   login  ->  main menu  ->  submenus  ->  save & exit
 *
 * @author USER
 */
public class Menu {

    private Scanner input;
    private FinanceManager fm;
    private FileManager fileMgr;
    private ReportGenerator reports;
    private User currentUser;   // the user who is logged in

    // Constructor: receives the shared objects and builds a ReportGenerator
    public Menu(FinanceManager fm, FileManager fileMgr) {
        this.input = new Scanner(System.in);
        this.fm = fm;
        this.fileMgr = fileMgr;
        this.reports = new ReportGenerator(fm);
        this.currentUser = null;
    }

    // ===== Helper: read a number safely (non-numeric input is rejected) =====

    private int readInt(String prompt) {
        System.out.print(prompt);
        while (!input.hasNextInt()) {
            System.out.println("Please enter a number!");
            input.next(); // throw away the invalid text
            System.out.print(prompt);
        }
        int value = input.nextInt();
        input.nextLine(); // consume the leftover newline
        return value;
    }

    // Same idea for money amounts: must be a positive number
    private double readDouble(String prompt) {
        System.out.print(prompt);
        while (!input.hasNextDouble()) {
            System.out.println("Please enter a valid amount!");
            input.next();
            System.out.print(prompt);
        }
        double value = input.nextDouble();
        input.nextLine();
        return value;
    }

    private String readLine(String prompt) {
        System.out.print(prompt);
        return input.nextLine();
    }

    // ===== LOGIN (plan section 5: "User logs in") =====

    // Simple classroom login: one normal user + one admin are
    // created here. Real user accounts would come from users.txt.
    public User login() {
        User normalUser = new User("ali", "1234", "Ali bin Ahmad");
        Admin admin = new Admin("admin", "admin", "System Administrator");

        System.out.println("===== PERSONAL FINANCE SYSTEM =====");
        while (currentUser == null) {
            String username = readLine("Username: ");
            String password = readLine("Password: ");

            if (normalUser.getUsername().equalsIgnoreCase(username)
                    && normalUser.login(password)) {
                currentUser = normalUser;
            } else if (admin.getUsername().equalsIgnoreCase(username)
                    && admin.login(password)) {
                currentUser = admin;
            } else {
                System.out.println("Wrong username or password. Try again.\n");
            }
        }
        System.out.println("Welcome, " + currentUser.getFullName() + "!");
        return currentUser;
    }

    // ===== MAIN MENU (plan section 8) =====

    public void run() {
        int choice;
        do {
            System.out.println("\n===== MAIN MENU =====");
            System.out.println("1. Dashboard");
            System.out.println("2. Income Management");
            System.out.println("3. Expense Management");
            System.out.println("4. Budget Management");
            System.out.println("5. Savings Goals");
            System.out.println("6. Financial Reports");
            System.out.println("7. Save Data");
            System.out.println("8. Exit");

            choice = readInt("Enter your choice: ");

            switch (choice) {
                case 1:
                    showDashboard();
                    break;
                case 2:
                    incomeMenu();
                    break;
                case 3:
                    expenseMenu();
                    break;
                case 4:
                    budgetMenu();
                    break;
                case 5:
                    savingsMenu();
                    break;
                case 6:
                    reportsMenu();
                    break;
                case 7:
                    fileMgr.saveAll(fm);
                    System.out.println("Data saved!");
                    break;
                case 8:
                    fileMgr.saveAll(fm);
                    System.out.println("Data saved. Thank you, "
                            + currentUser.getFullName() + "!");
                    break;
                default:
                    System.out.println("Invalid choice!");
            }
        } while (choice != 8);
    }

    // ===== Dashboard: quick overview (plan section 8, option 1) =====

    private void showDashboard() {
        System.out.println("\n===== DASHBOARD =====");
        System.out.println("Balance: RM" + fm.getBalance());
        System.out.println("Total income: RM" + fm.getTotalIncome()
                + " | Total expenses: RM" + fm.getTotalExpenses());

        // Budget warnings on the dashboard
        for (int i = 0; i < fm.getBudgetCount(); i++) {
            Budget b = fm.getBudgets()[i];
            String status = b.getStatus();
            if (!status.equals("Under control")) {
                System.out.println("ALERT - " + b.getCategory() + ": " + status);
            }
        }
    }

    // ===== INCOME submenu (admin sees the menu but cannot edit) =====

    private void incomeMenu() {
        int choice;
        do {
            System.out.println("\n===== INCOME MANAGEMENT =====");
            System.out.println("1. Add Income");
            System.out.println("2. View All Income");
            System.out.println("3. Search Income");
            System.out.println("4. Update Income");
            System.out.println("5. Delete Income");
            System.out.println("6. Back to Main Menu");

            choice = readInt("Enter your choice: ");
            switch (choice) {
                case 1:
                    if (!isNormalUser()) break;
                    String date = readLine("Date (dd/mm/yyyy): ");
                    String desc = readLine("Description: ");
                    double amount = readDouble("Amount (RM): ");
                    String source = readLine("Source: ");
                    Income income = new Income(date, desc, amount, source);
                    if (fm.addIncome(income)) {
                        System.out.println("Income recorded!");
                    } else {
                        System.out.println("Invalid amount (must be > RM0).");
                    }
                    break;
                case 2:
                    System.out.println("\n--- ALL INCOME ---");
                    for (int i = 0; i < fm.getIncomeCount(); i++) {
                        System.out.println((i + 1) + ".");
                        fm.getIncomes()[i].displayDetails();
                    }
                    if (fm.getIncomeCount() == 0) {
                        System.out.println("(no income recorded)");
                    }
                    break;
                case 3:
                    String src = readLine("Search source: ");
                    Income found = fm.searchIncomeBySource(src);
                    if (found != null) {
                        found.displayDetails();
                    } else {
                        System.out.println("No income from that source.");
                    }
                    break;
                case 4:
                    if (!isNormalUser()) break;
                    String srcU = readLine("Source to update: ");
                    double newAmt = readDouble("New amount (RM): ");
                    if (fm.updateIncomeAmount(srcU, newAmt)) {
                        System.out.println("Income updated!");
                    } else {
                        System.out.println("Income not found or invalid amount.");
                    }
                    break;
                case 5:
                    if (!isNormalUser()) break;
                    int pos = readInt("Income number to delete: ") - 1;
                    if (fm.deleteIncome(pos)) {
                        System.out.println("Income deleted.");
                    } else {
                        System.out.println("Income not found.");
                    }
                    break;
                case 6:
                    break;
                default:
                    System.out.println("Invalid choice!");
            }
        } while (choice != 6);
    }

    // ===== EXPENSE submenu =====

    private void expenseMenu() {
        int choice;
        do {
            System.out.println("\n===== EXPENSE MANAGEMENT =====");
            System.out.println("1. Add Expense");
            System.out.println("2. View All Expenses");
            System.out.println("3. Search Expense");
            System.out.println("4. Update Expense");
            System.out.println("5. Delete Expense");
            System.out.println("6. Back to Main Menu");

            choice = readInt("Enter your choice: ");
            switch (choice) {
                case 1:
                    if (!isNormalUser()) break;
                    String date = readLine("Date (dd/mm/yyyy): ");
                    String desc = readLine("Description: ");
                    double amount = readDouble("Amount (RM): ");
                    String category = readLine("Category (must exist): ");
                    Expense expense = new Expense(date, desc, amount, category);
                    if (fm.addExpense(expense)) {
                        System.out.println("Expense recorded!");
                        // Budget alert (plan section 9.4: alert at 100%)
                        Budget b = fm.findBudget(category);
                        if (b != null && b.getUsagePercent() >= 100) {
                            System.out.println("WARNING: " + category
                                    + " budget exceeded! " + b.getStatus());
                        } else if (b != null && b.getUsagePercent() >= 80) {
                            System.out.println("Heads up: you have used "
                                    + String.format("%.1f", b.getUsagePercent())
                                    + "% of your " + category + " budget.");
                        }
                    } else {
                        System.out.println("Invalid amount, or category does "
                                + "not exist. Ask an Admin to add categories.");
                    }
                    break;
                case 2:
                    System.out.println("\n--- ALL EXPENSES ---");
                    for (int i = 0; i < fm.getExpenseCount(); i++) {
                        System.out.println((i + 1) + ".");
                        fm.getExpenses()[i].displayDetails();
                    }
                    if (fm.getExpenseCount() == 0) {
                        System.out.println("(no expenses recorded)");
                    }
                    break;
                case 3:
                    String kw = readLine("Search keyword: ");
                    Expense found = fm.searchExpenseByDescription(kw);
                    if (found != null) {
                        found.displayDetails();
                    } else {
                        System.out.println("No expense matches that keyword.");
                    }
                    break;
                case 4:
                    if (!isNormalUser()) break;
                    int posU = readInt("Expense number to update: ") - 1;
                    double newAmt = readDouble("New amount (RM): ");
                    if (fm.updateExpenseAmount(posU, newAmt)) {
                        System.out.println("Expense updated!");
                    } else {
                        System.out.println("Expense not found or invalid amount.");
                    }
                    break;
                case 5:
                    if (!isNormalUser()) break;
                    int posD = readInt("Expense number to delete: ") - 1;
                    if (fm.deleteExpense(posD)) {
                        System.out.println("Expense deleted.");
                    } else {
                        System.out.println("Expense not found.");
                    }
                    break;
                case 6:
                    break;
                default:
                    System.out.println("Invalid choice!");
            }
        } while (choice != 6);
    }

    // ===== BUDGET submenu =====

    private void budgetMenu() {
        int choice;
        do {
            System.out.println("\n===== BUDGET MANAGEMENT =====");
            System.out.println("1. Set Monthly Budget");
            System.out.println("2. View Budgets");
            System.out.println("3. Check Budget Status");
            System.out.println("4. Back to Main Menu");

            choice = readInt("Enter your choice: ");
            switch (choice) {
                case 1:
                    if (!isNormalUser()) break;
                    String cat = readLine("Category: ");
                    double limit = readDouble("Monthly limit (RM): ");
                    if (fm.setBudget(cat, limit)) {
                        System.out.println("Budget saved!");
                    } else {
                        System.out.println("Invalid limit (must be > RM0), "
                                + "or category does not exist.");
                    }
                    break;
                case 2:
                    System.out.println("\n--- ALL BUDGETS ---");
                    for (int i = 0; i < fm.getBudgetCount(); i++) {
                        fm.getBudgets()[i].displayDetails();
                        System.out.println();
                    }
                    if (fm.getBudgetCount() == 0) {
                        System.out.println("(no budgets set)");
                    }
                    break;
                case 3:
                    String catS = readLine("Category to check: ");
                    Budget b = fm.findBudget(catS);
                    if (b != null) {
                        b.displayDetails();
                    } else {
                        System.out.println("No budget set for that category.");
                    }
                    break;
                case 4:
                    break;
                default:
                    System.out.println("Invalid choice!");
            }
        } while (choice != 4);
    }

    // ===== SAVINGS submenu =====

    private void savingsMenu() {
        int choice;
        do {
            System.out.println("\n===== SAVINGS GOALS =====");
            System.out.println("1. Create Savings Goal");
            System.out.println("2. View Savings Goals");
            System.out.println("3. Add Savings");
            System.out.println("4. Check Progress");
            System.out.println("5. Back to Main Menu");

            choice = readInt("Enter your choice: ");
            switch (choice) {
                case 1:
                    if (!isNormalUser()) break;
                    String name = readLine("Goal name: ");
                    double target = readDouble("Target amount (RM): ");
                    if (fm.addGoal(new SavingsGoal(name, target))) {
                        System.out.println("Goal created!");
                    } else {
                        System.out.println("Invalid target (must be > RM0).");
                    }
                    break;
                case 2:
                    System.out.println("\n--- ALL GOALS ---");
                    for (int i = 0; i < fm.getGoalCount(); i++) {
                        fm.getGoals()[i].displayDetails();
                        System.out.println();
                    }
                    if (fm.getGoalCount() == 0) {
                        System.out.println("(no savings goals yet)");
                    }
                    break;
                case 3:
                    String gName = readLine("Goal name: ");
                    double amt = readDouble("Amount to save (RM): ");
                    if (fm.addToGoal(gName, amt)) {
                        System.out.println("Savings added!");
                    } else {
                        System.out.println("Goal not found or invalid amount.");
                    }
                    break;
                case 4:
                    String gCheck = readLine("Goal name: ");
                    SavingsGoal g = null;
                    for (int i = 0; i < fm.getGoalCount(); i++) {
                        if (fm.getGoals()[i].getGoalName().equalsIgnoreCase(gCheck)) {
                            g = fm.getGoals()[i];
                        }
                    }
                    if (g != null) {
                        g.displayDetails();
                    } else {
                        System.out.println("Goal not found.");
                    }
                    break;
                case 5:
                    break;
                default:
                    System.out.println("Invalid choice!");
            }
        } while (choice != 5);
    }

    // ===== REPORTS submenu =====

    private void reportsMenu() {
        int choice;
        do {
            System.out.println("\n===== FINANCIAL REPORTS =====");
            System.out.println("1. Totals and Balance");
            System.out.println("2. Expense Breakdown by Category");
            System.out.println("3. Monthly Summary");
            System.out.println("4. Save Report to File");
            System.out.println("5. Back to Main Menu");

            choice = readInt("Enter your choice: ");
            switch (choice) {
                case 1:
                    reports.showTotals();
                    break;
                case 2:
                    reports.showExpenseBreakdown();
                    break;
                case 3:
                    reports.showMonthlySummary();
                    break;
                case 4:
                    reports.saveReportToFile();
                    break;
                case 5:
                    break;
                default:
                    System.out.println("Invalid choice!");
            }
        } while (choice != 5);
    }

    // ===== Role check (plan section 11: admin cannot edit records) =====

    private boolean isNormalUser() {
        if (currentUser instanceof Admin) {
            System.out.println("Admins can only manage categories. "
                    + "This action is for normal users.");
            return false;
        }
        return true;
    }
}
