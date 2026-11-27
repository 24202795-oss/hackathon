package hackathon;

/**
 * Parent class for all financial records.
 * Income and Expense both share a date, description and amount,
 * so those attributes live here and the child classes inherit them.
 *
 * @author USER
 */
public class Transaction {

    // Attributes (protected so child classes can use them directly)
    protected String date;
    protected String description;
    protected double amount;

    // Constructor: runs when a new Transaction object is created
    public Transaction(String date, String description, double amount) {
        this.date = date;
        this.description = description;
        this.amount = amount;
    }

    // Getter methods: return the value stored in each attribute
    public String getDate() {
        return date;
    }

    public String getDescription() {
        return description;
    }

    public double getAmount() {
        return amount;
    }

    // Setter methods: change the value of an existing attribute
    public void setDate(String date) {
        this.date = date;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    // Displays the details stored in this transaction
    public void displayDetails() {
        System.out.println("Date: " + date);
        System.out.println("Description: " + description);
        System.out.println("Amount: RM" + amount);
    }
}
