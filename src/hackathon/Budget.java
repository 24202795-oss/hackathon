package hackathon;

/**
 * Stores one monthly budget: a spending limit for one category.
 * Example: RM300 limit for the Food category.
 *
 * @author USER
 */
public class Budget {

    // Attributes
    private String owner;      // username this budget belongs to
    private String category;   // which category the limit applies to
    private double limit;      // maximum allowed spending (RM)
    private double spent;      // how much has been spent so far (RM)

    // Constructor
    public Budget(String owner, String category, double limit) {
        this.owner = owner;
        this.category = category;
        this.limit = limit;
        this.spent = 0;        // a new budget starts with nothing spent
    }

    // Getter/setter for the owner
    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    // Getter methods
    public String getCategory() {
        return category;
    }

    public double getLimit() {
        return limit;
    }

    public double getSpent() {
        return spent;
    }

    // Setter methods
    public void setCategory(String category) {
        this.category = category;
    }

    public void setLimit(double limit) {
        this.limit = limit;
    }

    // Records that money was spent on this category (called by
    // FinanceManager when an expense is added)
    public void addSpending(double amount) {
        spent = spent + amount;
    }

    // Calculated values (business rules from the project plan)

    // Remaining budget = limit - spent (section 9.4 of the plan)
    public double getRemaining() {
        return limit - spent;
    }

    // How much of the budget has been used, in percent
    public double getUsagePercent() {
        if (limit <= 0) {
            return 100; // avoid dividing by zero
        }
        return (spent / limit) * 100;
    }

    // Status message following the plan's warning levels (section 9.4):
    // below 80% = under control, 80%+ = approaching, 100%+ = exceeded
    public String getStatus() {
        double percent = getUsagePercent();
        if (percent > 100) {
            return "BUDGET EXCEEDED!";
        } else if (percent >= 80) {
            return "Approaching limit - be careful!";
        } else {
            return "Under control";
        }
    }

    // Display method
    public void displayDetails() {
        System.out.println("Category: " + category);
        System.out.println("Limit: RM" + limit);
        System.out.println("Spent: RM" + spent);
        System.out.println("Remaining: RM" + getRemaining());
        System.out.println("Usage: " + String.format("%.1f", getUsagePercent()) + "% - " + getStatus());
    }
}
