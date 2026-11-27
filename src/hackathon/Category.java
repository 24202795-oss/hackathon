package hackathon;

/**
 * Stores one expense category (Food, Transport, Shopping...).
 * A simple data class: it just holds information, like a row
 * in the categories list the Admin manages.
 *
 * @author USER
 */
public class Category {

    // Attributes
    private String name;
    private String description;

    // Constructor
    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Convenience constructor: a category without a description
    public Category(String name) {
        this(name, "");
    }

    // Getter methods
    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    // Setter methods
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Display method
    public void displayDetails() {
        System.out.println("Category: " + name);
        if (!description.isEmpty()) {
            System.out.println("Description: " + description);
        }
    }
}
