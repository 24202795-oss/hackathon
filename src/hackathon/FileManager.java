package hackathon;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.BufferedReader;
import java.io.FileReader;

/**
 * Saves all records to .txt files and loads them back when the
 * program restarts (plan section 10).
 *
 * File formats (fields separated by the | character):
 *   income.txt    Date|Description|Amount|Source
 *   expenses.txt  Date|Description|Amount|Category
 *   budgets.txt   Category|Limit|Spent
 *   savings.txt   GoalName|TargetAmount|SavedAmount
 *   categories.txt CategoryName
 *
 * All saving REWRITES the whole file from the current arrays
 * (never append), so updates and deletes are always reflected
 * and duplicates can never build up.
 *
 * @author USER
 */
public class FileManager {

    // ===== SAVING (rewrites each file from the live arrays) =====

    public void saveAll(FinanceManager fm) {
        saveIncome(fm);
        saveExpenses(fm);
        saveBudgets(fm);
        saveGoals(fm);
        saveCategories(fm);
    }

    // Income file: Date|Description|Amount|Source
    private void saveIncome(FinanceManager fm) {
        try {
            PrintWriter output = new PrintWriter(new FileWriter("income.txt"));
            Income[] incomes = fm.getIncomes();
            for (int i = 0; i < fm.getIncomeCount(); i++) {
                output.println(incomes[i].getDate() + "|"
                        + incomes[i].getDescription() + "|"
                        + incomes[i].getAmount() + "|"
                        + incomes[i].getSource());
            }
            output.close();
        } catch (IOException e) {
            System.out.println("Error saving income.txt!");
        }
    }

    // Expenses file: Date|Description|Amount|Category
    private void saveExpenses(FinanceManager fm) {
        try {
            PrintWriter output = new PrintWriter(new FileWriter("expenses.txt"));
            Expense[] expenses = fm.getExpenses();
            for (int i = 0; i < fm.getExpenseCount(); i++) {
                output.println(expenses[i].getDate() + "|"
                        + expenses[i].getDescription() + "|"
                        + expenses[i].getAmount() + "|"
                        + expenses[i].getCategory());
            }
            output.close();
        } catch (IOException e) {
            System.out.println("Error saving expenses.txt!");
        }
    }

    // Budgets file: Category|Limit|Spent (spent is saved so the
    // budget stays in sync with expenses across restarts)
    private void saveBudgets(FinanceManager fm) {
        try {
            PrintWriter output = new PrintWriter(new FileWriter("budgets.txt"));
            Budget[] budgets = fm.getBudgets();
            for (int i = 0; i < fm.getBudgetCount(); i++) {
                output.println(budgets[i].getCategory() + "|"
                        + budgets[i].getLimit() + "|"
                        + budgets[i].getSpent());
            }
            output.close();
        } catch (IOException e) {
            System.out.println("Error saving budgets.txt!");
        }
    }

    // Savings file: GoalName|TargetAmount|SavedAmount
    private void saveGoals(FinanceManager fm) {
        try {
            PrintWriter output = new PrintWriter(new FileWriter("savings.txt"));
            SavingsGoal[] goals = fm.getGoals();
            for (int i = 0; i < fm.getGoalCount(); i++) {
                output.println(goals[i].getGoalName() + "|"
                        + goals[i].getTargetAmount() + "|"
                        + goals[i].getSavedAmount());
            }
            output.close();
        } catch (IOException e) {
            System.out.println("Error saving savings.txt!");
        }
    }

    // Categories file: just the category name, one per line
    private void saveCategories(FinanceManager fm) {
        try {
            PrintWriter output = new PrintWriter(new FileWriter("categories.txt"));
            Category[] categories = fm.getCategories();
            for (int i = 0; i < fm.getCategoryCount(); i++) {
                output.println(categories[i].getName());
            }
            output.close();
        } catch (IOException e) {
            System.out.println("Error saving categories.txt!");
        }
    }

    // ===== LOADING (reads each file back into the manager) =====

    public void loadAll(FinanceManager fm) {
        loadCategories(fm);   // must load first: expenses need valid categories
        loadIncome(fm);
        loadExpenses(fm);
        loadBudgets(fm);
        loadGoals(fm);
    }

    // Helper: opens a file for reading, returns null if it does
    // not exist yet (first run of the program - not an error)
    private BufferedReader openReader(String filename) {
        try {
            return new BufferedReader(new FileReader(filename));
        } catch (IOException e) {
            return null; // missing file = empty records, not a crash
        }
    }

    private void loadIncome(FinanceManager fm) {
        BufferedReader reader = openReader("income.txt");
        if (reader == null) {
            return;
        }
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue; // skip blank lines
                }
                String[] data = line.split("\\|");
                // Format: Date|Description|Amount|Source
                Income income = new Income(
                        data[0], data[1],
                        Double.parseDouble(data[2]), data[3]);
                fm.addIncome(income);
            }
            reader.close();
        } catch (IOException | RuntimeException e) {
            System.out.println("Error reading income.txt: " + e.getMessage());
        }
    }

    private void loadExpenses(FinanceManager fm) {
        BufferedReader reader = openReader("expenses.txt");
        if (reader == null) {
            return;
        }
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] data = line.split("\\|");
                // Format: Date|Description|Amount|Category
                // addExpense is used (not a direct array write) so the
                // category validation and budget syncing still apply
                fm.addExpense(new Expense(
                        data[0], data[1],
                        Double.parseDouble(data[2]), data[3]));
            }
            reader.close();
        } catch (IOException | RuntimeException e) {
            System.out.println("Error reading expenses.txt: " + e.getMessage());
        }
    }

    private void loadBudgets(FinanceManager fm) {
        BufferedReader reader = openReader("budgets.txt");
        if (reader == null) {
            return;
        }
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] data = line.split("\\|");
                // Format: Category|Limit|Spent
                Budget budget = new Budget(data[0], Double.parseDouble(data[1]));
                budget.addSpending(Double.parseDouble(data[2]));
                fm.restoreBudget(budget);
                fm.addCategory(data[0]); // ensure the category exists (ignored if duplicate)
            }
            reader.close();
        } catch (IOException | RuntimeException e) {
            System.out.println("Error reading budgets.txt: " + e.getMessage());
        }
    }

    private void loadGoals(FinanceManager fm) {
        BufferedReader reader = openReader("savings.txt");
        if (reader == null) {
            return;
        }
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] data = line.split("\\|");
                // Format: GoalName|TargetAmount|SavedAmount
                SavingsGoal goal = new SavingsGoal(
                        data[0], Double.parseDouble(data[1]));
                goal.addSavings(Double.parseDouble(data[2]));
                fm.addGoal(goal);
            }
            reader.close();
        } catch (IOException | RuntimeException e) {
            System.out.println("Error reading savings.txt: " + e.getMessage());
        }
    }

    private void loadCategories(FinanceManager fm) {
        BufferedReader reader = openReader("categories.txt");
        if (reader == null) {
            return;
        }
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                fm.addCategory(line.trim());
            }
            reader.close();
        } catch (IOException e) {
            System.out.println("Error reading categories.txt: " + e.getMessage());
        }
    }
}
