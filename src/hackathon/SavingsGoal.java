package hackathon;

/**
 * Stores one savings goal: a target amount the user wants to save
 * and how much has been saved so far.
 * Example: Laptop RM2,000 target, RM800 saved.
 *
 * @author USER
 */
public class SavingsGoal {

    // Attributes
    private String owner;        // username this goal belongs to
    private String goalName;     // what the user is saving for
    private double targetAmount; // total amount needed (RM)
    private double savedAmount;  // amount saved so far (RM)

    // Constructor: a new goal starts with RM0 saved
    public SavingsGoal(String owner, String goalName, double targetAmount) {
        this.owner = owner;
        this.goalName = goalName;
        this.targetAmount = targetAmount;
        this.savedAmount = 0;
    }

    // Getter/setter for the owner
    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    // Getter methods
    public String getGoalName() {
        return goalName;
    }

    public double getTargetAmount() {
        return targetAmount;
    }

    public double getSavedAmount() {
        return savedAmount;
    }

    // Setter methods
    public void setGoalName(String goalName) {
        this.goalName = goalName;
    }

    public void setTargetAmount(double targetAmount) {
        this.targetAmount = targetAmount;
    }

    // Adds money to the savings (business rule: amount must be positive)
    public boolean addSavings(double amount) {
        if (amount <= 0) {
            return false; // reject zero or negative amounts
        }
        savedAmount = savedAmount + amount;
        return true;
    }

    // Calculated values (business rules from the project plan)

    // How much is still needed (section 9.5: target - saved)
    public double getRemaining() {
        return targetAmount - savedAmount;
    }

    // Progress percent = saved / target x 100 (section 9.5 of the plan)
    public double getProgressPercent() {
        if (targetAmount <= 0) {
            return 0; // avoid dividing by zero
        }
        return (savedAmount / targetAmount) * 100;
    }

    // Returns true when the goal has been fully reached
    public boolean isCompleted() {
        return savedAmount >= targetAmount;
    }

    // Display method
    public void displayDetails() {
        System.out.println("Goal: " + goalName);
        System.out.println("Target: RM" + targetAmount);
        System.out.println("Saved: RM" + savedAmount);
        System.out.println("Remaining: RM" + getRemaining());
        System.out.println("Progress: " + String.format("%.1f", getProgressPercent()) + "%");
        if (isCompleted()) {
            System.out.println("GOAL ACHIEVED! Well done!");
        }
    }
}
