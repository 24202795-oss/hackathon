package hackathon;

/**
 * Child class of Transaction.
 * An Expense record is a Transaction plus one extra attribute:
 * which category the money was spent on (Food, Transport, ...).
 *
 * @author USER
 */
public class Expense extends Transaction {

    // Extra attribute that only Expense has
    private String category;

    // Constructor: passes the shared attributes to the parent
    // class using super(), then stores its own category
    public Expense(String owner, String date, String description, double amount, String category) {
        super(owner, date, description, amount); // calls the Transaction constructor
        this.category = category;
    }

    // Getter and setter for the extra attribute
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // Overrides the parent's displayDetails() to also show the category
    @Override
    public void displayDetails() {
        super.displayDetails(); // prints date, description, amount first
        System.out.println("Category: " + category);
    }
}
