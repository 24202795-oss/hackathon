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

    // The logged-in username. All views and totals only consider
    // records whose owner matches, so different users each see
    // their own income, expenses, budgets and savings.
    private String currentOwner = "";

    // Called by Menu right after login
    public void setCurrentOwner(String username) {
        this.currentOwner = username;
    }

    // Used by FileManager during loading: records carry their owner
    // in the file, so addX is called once per record with that owner
    // temporarily active. NOT for normal runtime use.
    public void setOwnerForLoading(String username) {
        this.currentOwner = username;
    }

    public String getCurrentOwner() {
        return currentOwner;
    }

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

    // ===== Owner-filtered view helpers (the arrays hold ALL users'
    // records; the menu and reports must only show the current user's) =====

    // My income records, as a filtered view (index 0 = my first record)
    public Income[] getMyIncomes() {
        Income[] mine = new Income[incomeCount];
        int n = 0;
        for (int i = 0; i < incomeCount; i++) {
            if (incomes[i].getOwner().equals(currentOwner)) {
                mine[n] = incomes[i];
                n++;
            }
        }
        return trimIncomeView(mine, n);
    }

    public int getMyIncomeCount() {
        int n = 0;
        for (int i = 0; i < incomeCount; i++) {
            if (incomes[i].getOwner().equals(currentOwner)) {
                n++;
            }
        }
        return n;
    }

    // My expense records, as a filtered view
    public Expense[] getMyExpenses() {
        Expense[] mine = new Expense[expenseCount];
        int n = 0;
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getOwner().equals(currentOwner)) {
                mine[n] = expenses[i];
                n++;
            }
        }
        return trimExpenseView(mine, n);
    }

    public int getMyExpenseCount() {
        int n = 0;
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getOwner().equals(currentOwner)) {
                n++;
            }
        }
        return n;
    }

    // My budgets, as a filtered view
    public Budget[] getMyBudgets() {
        Budget[] mine = new Budget[budgetCount];
        int n = 0;
        for (int i = 0; i < budgetCount; i++) {
            if (budgets[i].getOwner().equals(currentOwner)) {
                mine[n] = budgets[i];
                n++;
            }
        }
        Budget[] exact = new Budget[n];
        for (int i = 0; i < n; i++) {
            exact[i] = mine[i];
        }
        return exact;
    }

    public int getMyBudgetCount() {
        int n = 0;
        for (int i = 0; i < budgetCount; i++) {
            if (budgets[i].getOwner().equals(currentOwner)) {
                n++;
            }
        }
        return n;
    }

    // My goals, as a filtered view
    public SavingsGoal[] getMyGoals() {
        SavingsGoal[] mine = new SavingsGoal[goalCount];
        int n = 0;
        for (int i = 0; i < goalCount; i++) {
            if (goals[i].getOwner().equals(currentOwner)) {
                mine[n] = goals[i];
                n++;
            }
        }
        SavingsGoal[] exact = new SavingsGoal[n];
        for (int i = 0; i < n; i++) {
            exact[i] = mine[i];
        }
        return exact;
    }

    public int getMyGoalCount() {
        int n = 0;
        for (int i = 0; i < goalCount; i++) {
            if (goals[i].getOwner().equals(currentOwner)) {
                n++;
            }
        }
        return n;
    }

    private Income[] trimIncomeView(Income[] source, int n) {
        Income[] exact = new Income[n];
        for (int i = 0; i < n; i++) {
            exact[i] = source[i];
        }
        return exact;
    }

    private Expense[] trimExpenseView(Expense[] source, int n) {
        Expense[] exact = new Expense[n];
        for (int i = 0; i < n; i++) {
            exact[i] = source[i];
        }
        return exact;
    }

    // ===== INCOME operations (filtered by owner) =====

    // Business rule: amount must be greater than RM0 (plan section 9.6).
    // The record is stamped with the current user's username.
    public boolean addIncome(Income income) {
        if (income == null || income.getAmount() <= 0) {
            return false;
        }
        if (incomeCount >= incomes.length) {
            return false; // array full
        }
        income.setOwner(currentOwner);
        incomes[incomeCount] = income;
        incomeCount++;
        return true;
    }

    // Search only within MY income records
    public Income searchIncomeBySource(String source) {
        for (int i = 0; i < incomeCount; i++) {
            if (incomes[i].getOwner().equals(currentOwner)
                    && incomes[i].getSource().equalsIgnoreCase(source)) {
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

    // Delete: remove by position, but only MY records count.
    // Position refers to the record's place in MY list (1-based in menu).
    public boolean deleteIncome(int position) {
        int realIndex = myIncomeIndex(position);
        if (realIndex == -1) {
            return false; // record does not exist
        }
        for (int i = realIndex; i < incomeCount - 1; i++) {
            incomes[i] = incomes[i + 1];
        }
        incomes[incomeCount - 1] = null;
        incomeCount--;
        return true;
    }

    // Translates a position in MY income list to the real array index
    private int myIncomeIndex(int position) {
        int myPosition = 0;
        for (int i = 0; i < incomeCount; i++) {
            if (incomes[i].getOwner().equals(currentOwner)) {
                if (myPosition == position) {
                    return i;
                }
                myPosition++;
            }
        }
        return -1;
    }

    // ===== EXPENSE operations (filtered by owner) =====

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
        expense.setOwner(currentOwner);
        expenses[expenseCount] = expense;
        expenseCount++;

        // Update MY matching budget (if one exists for this category)
        Budget b = findBudget(expense.getCategory());
        if (b != null) {
            b.addSpending(expense.getAmount());
        }
        return true;
    }

    public Expense searchExpenseByCategory(String category) {
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getOwner().equals(currentOwner)
                    && expenses[i].getCategory().equalsIgnoreCase(category)) {
                return expenses[i];
            }
        }
        return null;
    }

    public Expense searchExpenseByDescription(String keyword) {
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getOwner().equals(currentOwner)
                    && expenses[i].getDescription().toLowerCase()
                        .contains(keyword.toLowerCase())) {
                return expenses[i];
            }
        }
        return null;
    }

    // Position in MY expense list -> real index
    private int myExpenseIndex(int position) {
        int myPosition = 0;
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getOwner().equals(currentOwner)) {
                if (myPosition == position) {
                    return i;
                }
                myPosition++;
            }
        }
        return -1;
    }

    public boolean updateExpenseAmount(int position, double newAmount) {
        int realIndex = myExpenseIndex(position);
        if (realIndex == -1 || newAmount <= 0) {
            return false;
        }
        // Adjust MY budget too: subtract old amount, add new amount
        Expense e = expenses[realIndex];
        Budget b = findBudget(e.getCategory());
        if (b != null) {
            b.addSpending(newAmount - e.getAmount());
        }
        e.setAmount(newAmount);
        return true;
    }

    public boolean deleteExpense(int position) {
        int realIndex = myExpenseIndex(position);
        if (realIndex == -1) {
            return false;
        }
        // Remove the amount from MY matching budget before deleting
        Expense e = expenses[realIndex];
        Budget b = findBudget(e.getCategory());
        if (b != null) {
            b.addSpending(-e.getAmount());
        }
        for (int i = realIndex; i < expenseCount - 1; i++) {
            expenses[i] = expenses[i + 1];
        }
        expenses[expenseCount - 1] = null;
        expenseCount--;
        return true;
    }

    // ===== BUDGET operations (filtered by owner) =====

    // Business rule: budget must be greater than RM0
    public boolean setBudget(String category, double limit) {
        if (limit <= 0) {
            return false;
        }
        // If MY budget for this category already exists, update it instead
        Budget existing = findBudget(category);
        if (existing != null) {
            existing.setLimit(limit);
            return true;
        }
        if (budgetCount >= budgets.length) {
            return false;
        }
        Budget newBudget = new Budget(currentOwner, category, limit);
        // Backfill: count MY expenses already recorded for this category
        // BEFORE the budget existed, so the budget starts in sync
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getOwner().equals(currentOwner)
                    && expenses[i].getCategory().equalsIgnoreCase(category)) {
                newBudget.addSpending(expenses[i].getAmount());
            }
        }
        budgets[budgetCount] = newBudget;
        budgetCount++;
        return true;
    }

    public Budget findBudget(String category) {
        for (int i = 0; i < budgetCount; i++) {
            if (budgets[i].getOwner().equals(currentOwner)
                    && budgets[i].getCategory().equalsIgnoreCase(category)) {
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

    // ===== SAVINGS GOAL operations (filtered by owner) =====

    // Business rule: target must be greater than RM0
    public boolean addGoal(SavingsGoal goal) {
        if (goal == null || goal.getTargetAmount() <= 0) {
            return false;
        }
        if (goalCount >= goals.length) {
            return false;
        }
        goal.setOwner(currentOwner);
        goals[goalCount] = goal;
        goalCount++;
        return true;
    }

    public boolean addToGoal(String goalName, double amount) {
        for (int i = 0; i < goalCount; i++) {
            if (goals[i].getOwner().equals(currentOwner)
                    && goals[i].getGoalName().equalsIgnoreCase(goalName)) {
                return goals[i].addSavings(amount); // goal validates amount itself
            }
        }
        return false; // goal not found
    }

    // Find MY goal by name (used by the menu's progress check)
    public SavingsGoal findGoal(String goalName) {
        for (int i = 0; i < goalCount; i++) {
            if (goals[i].getOwner().equals(currentOwner)
                    && goals[i].getGoalName().equalsIgnoreCase(goalName)) {
                return goals[i];
            }
        }
        return null;
    }

    // ===== CATEGORY operations (used by Admin) =====

    public boolean addCategory(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        if (categoryCount >= categories.length) {
            return false;
        }
        // Business rule: no duplicate categories (loading may offer
        // the same category twice - from categories.txt and budgets.txt)
        if (isValidCategory(name)) {
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

    // ===== FINANCIAL CALCULATIONS (plan section 9) - MY records only =====

    // Total income = sum of MY income records (section 9.1)
    public double getTotalIncome() {
        double total = 0;
        for (int i = 0; i < incomeCount; i++) {
            if (incomes[i].getOwner().equals(currentOwner)) {
                total = total + incomes[i].getAmount();
            }
        }
        return total;
    }

    // Total expenses = sum of MY expense records (section 9.2)
    public double getTotalExpenses() {
        double total = 0;
        for (int i = 0; i < expenseCount; i++) {
            if (expenses[i].getOwner().equals(currentOwner)) {
                total = total + expenses[i].getAmount();
            }
        }
        return total;
    }

    // Balance = total income - total expenses (section 9.3)
    public double getBalance() {
        return getTotalIncome() - getTotalExpenses();
    }

    // Total saved across MY goals
    public double getTotalSaved() {
        double total = 0;
        for (int i = 0; i < goalCount; i++) {
            if (goals[i].getOwner().equals(currentOwner)) {
                total = total + goals[i].getSavedAmount();
            }
        }
        return total;
    }
}
