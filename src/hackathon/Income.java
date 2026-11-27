package hackathon;

/**
 * Child class of Transaction.
 * An Income record is a Transaction plus one extra attribute:
 * where the money came from (allowance, salary, part-time work...).
 *
 * @author USER
 */
public class Income extends Transaction {

    // Extra attribute that only Income has
    private String source;

    // Constructor: first passes date, description, amount up to
    // the parent class using super(), then stores its own source
    public Income(String date, String description, double amount, String source) {
        super(date, description, amount); // calls the Transaction constructor
        this.source = source;
    }

    // Getter and setter for the extra attribute
    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    // Overrides the parent's displayDetails() to also show the source
    @Override
    public void displayDetails() {
        super.displayDetails(); // prints date, description, amount first
        System.out.println("Source: " + source);
    }
}
