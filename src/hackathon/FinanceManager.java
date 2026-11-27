package hackathon;

/**
 * The central manager of the system.
 * Holds all the plain Java arrays + counters and provides
 * add / view / search / update / delete operations for each.
 * This is the ONLY class that stores records (AHelper and the
 * reports read through its getters; the menu calls its methods).
 *
 * @author USER
 */
public class FinanceManager {

    // ===== Arrays (plain Java arrays, no ArrayList - per project rules) =====
    private Income[] incomes = new Income[100];
    private Expense[] expenses = new Expense[100];
    private Budget[] budgets = new Budget[50];
    private SavingsGoal[] goals = new SavingsGoal[50];
    private Category[] categories = new Category[50];

    // ===== Counters: how many slots of each array are actually used =====
    private int incomeCount = 0;
    private int expenseCount = 0;
    private int budgetCount = 0;
    private int goalCount = 0;
    private int categoryCount = 0;

    // ===== Getters the other classes need (AHelper, FileManager, ReportGenerator) =====

    public Income[] getIncomes() { return incomes; }
    public Expense[] getExpenses() { return expenses; }
    public Budget[] getBudgets() { return budgets; }
    public SavingsGoal[] getGoals() { return goals; }
    public Category[] getCategories() { return categories; }

    public int getIncomeCount() { return incomeCount; }
    public int getExpenseCount() { return expenseCount; }
    public int getBudgetCount() { return budgetCount; }
    public int getGoalCount() { return goalCount; }
    public int getCategoryCount() { return categoryCount; }

    // ===== INCOME operations =====

    // Business rule: amount must be greater than RM0 (plan section 9.6)
    public boolean addIncome(Income income) {
        if (income == null || income.getAmount() <= 0) {
            return false;
        }
        if (incomeCount >= incomes.length) {
            return false; // array full
        }
        incomes[incomeCount] = income;
        incomeCount++;
        return true;
    }

    public Income searchIncomeBySource(String source) {
        for (int i = 0; i < incomeCount; i++) {
            if (incomes[i].getSource().equalsIgnoreCase(source)) {
                return incomes[i];
            }
        }
        return null; // not found
    }

    // Update: replace an income record's amount (record must exist)
    public boolean updateIncomeAmount(String source, double newAmount) {
        Income found = searchIncomeBySource(source);
        if (found == null || newAmount <= 0) {
            return false;
        }
        found.setAmount(newAmount);
        return true;
    }

    // Delete: remove by position and shift the rest left (plan section 7)
    public boolean deleteIncome(int position) {
        if (position < 0 || position >= incomeCount) {
            return false; // record does not exist
        }
        for (int i = position; i < incomeCount - 1; i++) {
            incomes[i] = incomes[i + 1];
        }
        incomes[incomeCount - 1] = null;
        incomeCount--;
        return true;
    }

    // ===== EXPENSE operations =====

    // Business rules: amount > 0 and category must be valid (plan section 9.6)
    public boolean addExpense(Expense expense) {
        if (expense == null || expense.getAmount() <= 0) {
            return false;
        }
        if (!isValidCategory(expense.getCategory())) {
            return false;
        }
        if (expenseCount >= expenses.length) {
            return false;
        }
        expenses[expenseCount] = expense;
        expenseCount++;

        // Update the matching budget (if one exists for this category)
        Budget b = findBudget(expense.getCategory());
        if (b != null) {
            b.addSpending(expense.getAmount());
        }
        return true;
    }

    public Expense searchExpenseByCategory(String category) {
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getCategory().equalsIgnoreCase(category)) {
                return expenses[i];
            }
        }
        return null;
    }

    public Expense searchExpenseByDescription(String keyword) {
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getDescription().toLowerCase()
                    .contains(keyword.toLowerCase())) {
                return expenses[i];
            }
        }
        return null;
    }

    public boolean updateExpenseAmount(int position, double newAmount) {
        if (position < 0 || position >= expenseCount || newAmount <= 0) {
            return false;
        }
        // Adjust the budget too: subtract old amount, add new amount
        Expense e = expenses[position];
        Budget b = findBudget(e.getCategory());
        if (b != null) {
            b.addSpending(newAmount - e.getAmount());
        }
        e.setAmount(newAmount);
        return true;
    }

    public boolean deleteExpense(int position) {
        if (position < 0 || position >= expenseCount) {
            return false;
        }
        // Remove the amount from the matching budget before deleting
        Expense e = expenses[position];
        Budget b = findBudget(e.getCategory());
        if (b != null) {
            b.addSpending(-e.getAmount());
        }
        for (int i = position; i < expenseCount - 1; i++) {
            expenses[i] = expenses[i + 1];
        }
        expenses[expenseCount - 1] = null;
        expenseCount--;
        return true;
    }

    // ===== BUDGET operations =====

    // Business rule: budget must be greater than RM0
    public boolean setBudget(String category, double limit) {
        if (limit <= 0) {
            return false;
        }
        // If a budget for this category already exists, update it instead
        Budget existing = findBudget(category);
        if (existing != null) {
            existing.setLimit(limit);
            return true;
        }
        if (budgetCount >= budgets.length) {
            return false;
        }
        Budget newBudget = new Budget(category, limit);
        // Backfill: count expenses already recorded for this category
        // BEFORE the budget existed, so the budget starts in sync
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getCategory().equalsIgnoreCase(category)) {
                newBudget.addSpending(expenses[i].getAmount());
            }
        }
        budgets[budgetCount] = newBudget;
        budgetCount++;
        return true;
    }

    public Budget findBudget(String category) {
        for (int i = 0; i < budgetCount; i++) {
            if (budgets[i].getCategory().equalsIgnoreCase(category)) {
                return budgets[i];
            }
        }
        return null;
    }

    // Used by FileManager when loading: restores a budget with its
    // already-spent amount, without triggering the backfill logic
    public boolean restoreBudget(Budget budget) {
        if (budget == null || budgetCount >= budgets.length) {
            return false;
        }
        budgets[budgetCount] = budget;
        budgetCount++;
        return true;
    }

    // ===== SAVINGS GOAL operations =====

    // Business rule: target must be greater than RM0
    public boolean addGoal(SavingsGoal goal) {
        if (goal == null || goal.getTargetAmount() <= 0) {
            return false;
        }
        if (goalCount >= goals.length) {
            return false;
        }
        goals[goalCount] = goal;
        goalCount++;
        return true;
    }

    public boolean addToGoal(String goalName, double amount) {
        for (int i = 0; i < goalCount; i++) {
            if (goals[i].getGoalName().equalsIgnoreCase(goalName)) {
                return goals[i].addSavings(amount); // goal validates amount itself
            }
        }
        return false; // goal not found
    }

    // ===== CATEGORY operations (used by Admin) =====

    public boolean addCategory(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        if (categoryCount >= categories.length) {
            return false;
        }
        categories[categoryCount] = new Category(name);
        categoryCount++;
        return true;
    }

    // Business rule: expense category must be valid
    public boolean isValidCategory(String name) {
        for (int i = 0; i < categoryCount; i++) {
            if (categories[i].getName().equalsIgnoreCase(name)) {
                return true;
            }
        }
        return false;
    }

    // ===== FINANCIAL CALCULATIONS (plan section 9) =====

    // Total income = sum of all income records (section 9.1)
    public double getTotalIncome() {
        double total = 0;
        for (int i = 0; i < incomeCount; i++) {
            total = total + incomes[i].getAmount();
        }
        return total;
    }

    // Total expenses = sum of all expense records (section 9.2)
    public double getTotalExpenses() {
        double total = 0;
        for (int i = 0; i < expenseCount; i++) {
            total = total + expenses[i].getAmount();
        }
        return total;
    }

    // Balance = total income - total expenses (section 9.3)
    public double getBalance() {
        return getTotalIncome() - getTotalExpenses();
    }

    // Total saved across all goals
    public double getTotalSaved() {
        double total = 0;
        for (int i = 0; i < goalCount; i++) {
            total = total + goals[i].getSavedAmount();
        }
        return total;
    }
}
