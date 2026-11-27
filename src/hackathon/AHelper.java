package hackathon;

/**
 * AHelper - the AI Financial Advisor (rule-based expert system).
 *
 * Analyses the logged-in user's real records through FinanceManager's
 * getters and produces natural-language advice. No external API:
 * the "intelligence" is decision rules (thresholds, comparisons,
 * ranking) - an expert-system / decision-support design that runs
 * fully offline.
 *
 * AHelper owns NO arrays of its own and never changes records.
 * See .scratch/ai-helper/spec.md for the full design.
 *
 * @author USER
 */
public class AHelper {

    private FinanceManager fm;   // reads the user's data through this

    // Constructor: built around one manager, like ReportGenerator
    public AHelper(FinanceManager fm) {
        this.fm = fm;
    }

    // ===== Shared helper =====

    // Percentage of a whole, guarded against divide-by-zero
    private double percent(double part, double whole) {
        if (whole <= 0) {
            return 0;
        }
        return (part / whole) * 100;
    }

    // Empty-data guard used by every behaviour
    private boolean hasNoData() {
        return fm.getIncomeCount() == 0 && fm.getExpenseCount() == 0;
    }

    // Sum of MY expenses for one category
    private double myCategoryTotal(String category) {
        double total = 0;
        for (int i = 0; i < fm.getExpenseCount(); i++) {
            if (fm.getExpenses()[i].getOwner().equals(fm.getCurrentOwner())
                    && fm.getExpenses()[i].getCategory().equalsIgnoreCase(category)) {
                total = total + fm.getExpenses()[i].getAmount();
            }
        }
        return total;
    }

    // ===== Behaviour 1: analyse spending patterns (spec 3.1) =====

    // Ranks MY categories from highest to lowest spending and
    // reports the top category with its share of the total.
    public void analyzeSpending() {
        System.out.println("\n===== AHELPER: SPENDING ANALYSIS =====");

        if (hasNoData()) {
            System.out.println("I don't have any records yet. Add some "
                    + "income and expenses first, then ask me again!");
            return;
        }

        Category[] categories = fm.getCategories();
        int categoryCount = fm.getCategoryCount();
        String[] names = new String[categoryCount];
        double[] totals = new double[categoryCount];
        int used = 0;

        // Group: total MY expenses per category (parallel arrays)
        for (int c = 0; c < categoryCount; c++) {
            String name = categories[c].getName();
            double total = myCategoryTotal(name);
            names[used] = name;
            totals[used] = total;
            used++;
        }

        // Rank: bubble sort, highest first (swap name with total!)
        for (int i = 0; i < used - 1; i++) {
            for (int j = 0; j < used - 1 - i; j++) {
                if (totals[j] < totals[j + 1]) {
                    double temp = totals[j];
                    totals[j] = totals[j + 1];
                    totals[j + 1] = temp;
                    String tempName = names[j];
                    names[j] = names[j + 1];
                    names[j + 1] = tempName;
                }
            }
        }

        double grandTotal = fm.getTotalExpenses();
        System.out.println("Your biggest spending category is " + names[0]
                + " (RM" + String.format("%.2f", totals[0]) + ", "
                + String.format("%.1f", percent(totals[0], grandTotal))
                + "% of your expenses).");

        // Context: compare top with the runner-up
        if (used > 1 && totals[1] > 0) {
            System.out.println("That is " + String.format("%.1f",
                    totals[0] / totals[1]) + "x your next category ("
                    + names[1] + ").");
        }

        // The ranked list
        System.out.println("\nFull ranking:");
        for (int i = 0; i < used; i++) {
            if (totals[i] > 0) {
                System.out.println("  " + (i + 1) + ". " + names[i]
                        + " - RM" + String.format("%.2f", totals[i])
                        + " (" + String.format("%.1f", percent(totals[i], grandTotal)) + "%)");
            }
        }
    }

    // ===== Behaviour 2: predict budget status (spec 3.2) =====

    // Projects month-end spending from the user's current pace:
    // total MY expenses spread over the days covered by the records,
    // then extrapolated to a 31-day month.
    public void predictBudgetStatus() {
        System.out.println("\n===== AHELPER: BUDGET PREDICTION =====");

        if (fm.getExpenseCount() == 0) {
            System.out.println("No expenses recorded yet - nothing to "
                    + "predict. Record your daily spending and I will "
                    + "forecast your month-end budget.");
            return;
        }

        // Pace: total expenses / number of distinct days with records.
        // Dates are Strings (dd/mm/yyyy); extract the day part.
        double totalExpenses = fm.getTotalExpenses();
        int days = countMyActiveDays();
        if (days == 0) {
            days = 1; // safety: never divide by zero
        }
        double perDay = totalExpenses / days;
        double projected = perDay * 31;   // project a full month

        System.out.println("You have spent RM" + String.format("%.2f", totalExpenses)
                + " across " + days + " active day(s), about RM"
                + String.format("%.2f", perDay) + " per day.");
        System.out.println("At this pace you will spend about RM"
                + String.format("%.2f", projected) + " this month.");

        // Compare the projection against each of MY budgets
        if (fm.getMyBudgetCount() == 0) {
            System.out.println("(You have no budgets set yet - set one "
                    + "so I can warn you before you overshoot.)");
            return;
        }
        for (int i = 0; i < fm.getMyBudgetCount(); i++) {
            Budget b = fm.getMyBudgets()[i];
            double categoryTotal = myCategoryTotal(b.getCategory());
            double categoryProjection = (categoryTotal / days) * 31;
            double remaining = b.getLimit() - categoryProjection;

            if (remaining < 0) {
                System.out.println("WARNING: " + b.getCategory()
                        + " budget (RM" + String.format("%.2f", b.getLimit())
                        + ") is projected to be EXCEEDED by RM"
                        + String.format("%.2f", -remaining) + "!");
            } else {
                System.out.println("ON TRACK: " + b.getCategory()
                        + " budget should finish the month with about RM"
                        + String.format("%.2f", remaining) + " left.");
            }
        }
    }

    // Counts distinct days (dd part of my expense dates) for the pace calc
    private int countMyActiveDays() {
        // Count distinct day numbers among MY expense dates
        int[] days = new int[31];       // day 1..31 flags
        int distinct = 0;
        for (int i = 0; i < fm.getExpenseCount(); i++) {
            if (fm.getExpenses()[i].getOwner().equals(fm.getCurrentOwner())) {
                String[] dateParts = fm.getExpenses()[i].getDate().split("/");
                int day = Integer.parseInt(dateParts[0]);
                if (day >= 1 && day <= 31 && days[day - 1] == 0) {
                    days[day - 1] = 1;
                    distinct++;
                }
            }
        }
        return distinct;
    }

    // ===== Behaviour 3: savings suggestions (spec 3.3) =====

    // Uses MY balance and MY goals to suggest a saving pace
    public void suggestSavings() {
        System.out.println("\n===== AHELPER: SAVINGS SUGGESTIONS =====");

        if (hasNoData()) {
            System.out.println("I need to see your income and expenses "
                    + "first - add some records and come back!");
            return;
        }

        double balance = fm.getBalance();
        System.out.println("Your current balance: RM"
                + String.format("%.2f", balance));

        if (balance <= 0) {
            System.out.println("Your balance is not positive right now. "
                    + "Focus on reducing expenses before saving.");
            return;
        }

        if (fm.getGoalCount() == 0) {
            System.out.println("You have no savings goals yet. You could "
                    + "put about RM" + String.format("%.2f", balance)
                    + " towards a goal - create one in the Savings menu!");
            return;
        }

        // For each of MY goals: how long until it is funded at this balance
        for (int i = 0; i < fm.getGoalCount(); i++) {
            SavingsGoal g = fm.getGoals()[i];
            if (!g.getOwner().equals(fm.getCurrentOwner())) {
                continue;
            }
            double remaining = g.getRemaining();
            if (remaining <= 0) {
                System.out.println("Goal '" + g.getGoalName()
                        + "' is already complete - well done!");
            } else {
                // Suggest saving 50% of the balance each month
                double monthlySave = balance * 0.5;
                int months = (int) Math.ceil(remaining / monthlySave);
                System.out.println("Goal '" + g.getGoalName() + "' needs RM"
                        + String.format("%.2f", remaining) + " more. If you save "
                        + "about RM" + String.format("%.2f", monthlySave)
                        + "/month (50% of your balance), it completes in about "
                        + months + " month(s).");
            }
        }
    }

    // ===== Behaviour 4: personalised tips (spec 3.4) =====

    // If-else rules over the same numbers; always gives at least one tip
    public void giveTips() {
        System.out.println("\n===== AHELPER: PERSONALISED TIPS =====");

        if (hasNoData()) {
            System.out.println("No data yet - my tips get smarter once "
                    + "you record income and expenses!");
            return;
        }

        int tipNumber = 1;
        double totalIncome = fm.getTotalIncome();
        double totalExpenses = fm.getTotalExpenses();
        double balance = fm.getBalance();

        // Rule 1: any category eating more than 40% of expenses
        Category[] categories = fm.getCategories();
        for (int c = 0; c < fm.getCategoryCount(); c++) {
            String name = categories[c].getName();
            double share = percent(myCategoryTotal(name), totalExpenses);
            if (share > 40) {
                System.out.println(tipNumber + ". Your " + name
                        + " spending takes " + String.format("%.1f", share)
                        + "% of all expenses - the biggest slice of your money. "
                        + "Look for savings there first.");
                tipNumber++;
            }
        }

        // Rule 2: any of MY budgets at or past 80% usage
        for (int i = 0; i < fm.getMyBudgetCount(); i++) {
            Budget b = fm.getMyBudgets()[i];
            if (b.getUsagePercent() >= 80) {
                System.out.println(tipNumber + ". Your " + b.getCategory()
                        + " budget is " + String.format("%.1f", b.getUsagePercent())
                        + "% used - " + b.getStatus());
                tipNumber++;
            }
        }

        // Rule 3: spending more than 90% of income
        if (totalIncome > 0 && percent(totalExpenses, totalIncome) > 90) {
            System.out.println(tipNumber + ". You are spending "
                    + String.format("%.1f", percent(totalExpenses, totalIncome))
                    + "% of your income. Keep expenses below 80% to build savings.");
            tipNumber++;
        }

        // Rule 4: no savings goal set (checks MY goals)
        if (fm.getMyGoalCount() == 0) {
            System.out.println(tipNumber + ". You have no savings goal. "
                    + "Setting one (even a small one) makes saving a habit.");
            tipNumber++;
        }

        // Fallback: nothing triggered - positive message
        if (tipNumber == 1) {
            System.out.println("You are on track - keep recording your "
                    + "expenses daily and stay within your budgets!");
        }
    }

    // ===== Behaviour 5: simple Q&A (spec 3.5 - preset questions) =====

    // The Menu passes its Scanner in - AHelper never creates its own
    public void chat(java.util.Scanner input) {
        System.out.println("\n===== AHELPER: ASK ME =====");
        System.out.println("1. Where does my money go?");
        System.out.println("2. Will I exceed my budget?");
        System.out.println("3. How can I save more?");
        System.out.println("4. Give me personalised tips");
        System.out.println("5. Back");

        int choice = input.nextInt();
        input.nextLine();

        switch (choice) {
            case 1:
                analyzeSpending();
                break;
            case 2:
                predictBudgetStatus();
                break;
            case 3:
                suggestSavings();
                break;
            case 4:
                giveTips();
                break;
            case 5:
                break;
            default:
                System.out.println("Invalid choice!");
        }
    }
}
