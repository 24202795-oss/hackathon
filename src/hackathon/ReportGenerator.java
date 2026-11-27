package hackathon;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Generates financial reports from the data held in FinanceManager.
 * Produces summaries on screen and saves a full report to report.txt
 * (assignment requirement: "save generated reports to a file").
 *
 * This class only READS data through FinanceManager's getters and
 * calculation methods - it never changes any record.
 *
 * @author USER
 */
public class ReportGenerator {

    private FinanceManager fm;   // reads data through this

    // Constructor: the generator is built around one manager
    public ReportGenerator(FinanceManager fm) {
        this.fm = fm;
    }

    // ===== Report 1: totals and balance (reports submenu 1-3) =====

    public void showTotals() {
        System.out.println("\n===== FINANCIAL TOTALS =====");
        System.out.println("Total income:    RM" + fm.getTotalIncome());
        System.out.println("Total expenses:  RM" + fm.getTotalExpenses());
        System.out.println("Remaining balance: RM" + fm.getBalance());
    }

    // Sum of MY expenses for one category (owner-filtered)
    private double myCategoryTotal(String category) {
        double total = 0;
        Expense[] expenses = fm.getMyExpenses();
        for (int i = 0; i < expenses.length; i++) {
            if (expenses[i].getCategory().equalsIgnoreCase(category)) {
                total = total + expenses[i].getAmount();
            }
        }
        return total;
    }

    // ===== Report 2: expense breakdown by category (submenu 4) =====

    // Sums MY expenses of each category using the manager's own
    // category list, and prints them from highest to lowest.
    public void showExpenseBreakdown() {
        System.out.println("\n===== EXPENSE BREAKDOWN BY CATEGORY =====");

        Category[] categories = fm.getCategories();
        int categoryCount = fm.getCategoryCount();

        if (fm.getMyExpenseCount() == 0) {
            System.out.println("No expenses recorded yet.");
            return;
        }

        // Two parallel arrays: the category name and its total
        String[] names = new String[categoryCount];
        double[] totals = new double[categoryCount];
        int used = 0;

        // Loop over categories first, then expenses (the grouping loop)
        for (int c = 0; c < categoryCount; c++) {
            String name = categories[c].getName();
            double total = myCategoryTotal(name);
            names[used] = name;
            totals[used] = total;
            used++;
        }

        // Simple selection sort (highest first) - plain arrays only
        for (int i = 0; i < used - 1; i++) {
            for (int j = 0; j < used - 1 - i; j++) {
                if (totals[j] < totals[j + 1]) {
                    // swap totals
                    double temp = totals[j];
                    totals[j] = totals[j + 1];
                    totals[j + 1] = temp;
                    // swap matching names
                    String tempName = names[j];
                    names[j] = names[j + 1];
                    names[j + 1] = tempName;
                }
            }
        }

        // Print the ranked list with percentages
        double grandTotal = fm.getTotalExpenses();
        for (int i = 0; i < used; i++) {
            if (totals[i] > 0) {
                double percent = (totals[i] / grandTotal) * 100;
                System.out.println(String.format("%-15s RM%8.2f  (%.1f%%)",
                        names[i], totals[i], percent));
            }
        }
        System.out.println("TOTAL: RM" + String.format("%.2f", grandTotal));
    }

    // ===== Report 3: monthly financial summary (submenu 5) =====

    public void showMonthlySummary() {
        System.out.println("\n===== MONTHLY FINANCIAL SUMMARY =====");
        System.out.println("Income records:  " + fm.getIncomeCount());
        System.out.println("Expense records: " + fm.getExpenseCount());
        System.out.println("Total income:    RM" + fm.getTotalIncome());
        System.out.println("Total expenses:  RM" + fm.getTotalExpenses());
        System.out.println("Balance:         RM" + fm.getBalance());
        System.out.println("Saved in goals:  RM" + fm.getTotalSaved());

        // Budget section (my budgets only)
        System.out.println("\nBudget status:");
        for (int i = 0; i < fm.getMyBudgetCount(); i++) {
            Budget b = fm.getMyBudgets()[i];
            System.out.println("  " + b.getCategory() + ": RM" + b.getSpent()
                    + " of RM" + b.getLimit() + " used (" + b.getStatus() + ")");
        }

        // Savings goals section (my goals only)
        System.out.println("\nSavings goals:");
        for (int i = 0; i < fm.getMyGoalCount(); i++) {
            SavingsGoal g = fm.getMyGoals()[i];
            System.out.println("  " + g.getGoalName() + ": "
                    + String.format("%.1f", g.getProgressPercent()) + "% funded"
                    + (g.isCompleted() ? " [DONE]" : ""));
        }
    }

    // ===== Report 4: save the full report to report.txt =====

    public boolean saveReportToFile() {
        try {
            PrintWriter output = new PrintWriter(new FileWriter("report.txt"));

            output.println("=========================================");
            output.println(" PERSONAL FINANCE SYSTEM - REPORT");
            output.println("=========================================");
            output.println();

            output.println("--- Totals ---");
            output.println("Total income:    RM" + fm.getTotalIncome());
            output.println("Total expenses:  RM" + fm.getTotalExpenses());
            output.println("Remaining balance: RM" + fm.getBalance());
            output.println();

            output.println("--- Expense breakdown by category ---");
            Category[] categories = fm.getCategories();
            for (int c = 0; c < fm.getCategoryCount(); c++) {
                String name = categories[c].getName();
                double total = myCategoryTotal(name);
                if (total > 0) {
                    double percent = (total / fm.getTotalExpenses()) * 100;
                    output.println(String.format("%-15s RM%8.2f  (%.1f%%)",
                            name, total, percent));
                }
            }
            output.println();

            output.println("--- Budgets ---");
            for (int i = 0; i < fm.getMyBudgetCount(); i++) {
                Budget b = fm.getMyBudgets()[i];
                output.println("  " + b.getCategory() + ": RM" + b.getSpent()
                        + " of RM" + b.getLimit() + " (" + b.getStatus() + ")");
            }
            output.println();

            output.println("--- Savings goals ---");
            for (int i = 0; i < fm.getMyGoalCount(); i++) {
                SavingsGoal g = fm.getMyGoals()[i];
                output.println("  " + g.getGoalName() + ": RM" + g.getSavedAmount()
                        + " of RM" + g.getTargetAmount()
                        + " (" + String.format("%.1f", g.getProgressPercent()) + "%)");
            }

            output.close();
            System.out.println("Report saved to report.txt");
            return true;
        } catch (IOException e) {
            System.out.println("Error saving report.txt!");
            return false;
        }
    }
}
