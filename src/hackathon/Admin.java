package hackathon;

/**
 * Child class of User.
 * An Admin is a User who can additionally manage the system's
 * expense categories and view registered users (see the roles table
 * in the project plan).
 *
 * @author USER
 */
public class Admin extends User {

    // Extra attribute that only Admin has: how many categories
    // this admin has created (a small counter for demo purposes)
    private int categoriesManaged;

    // Constructor: passes the shared attributes up to the parent
    // class using super(), then initialises its own counter
    public Admin(String username, String password, String fullName) {
        super(username, password, fullName); // calls the User constructor
        this.categoriesManaged = 0;
    }

    // Overrides the parent's displayDetails() to show the Admin role
    @Override
    public void displayDetails() {
        System.out.println("Username: " + username);
        System.out.println("Name: " + fullName);
        System.out.println("Role: Admin");
    }

    // Admin-only behaviour: add a new expense category to the system.
    // Returns true if added, false if the category name is empty.
    public boolean addCategory(String[] categories, int count, String newCategory) {
        if (newCategory == null || newCategory.trim().isEmpty()) {
            return false; // business rule: category name cannot be empty
        }
        if (count >= categories.length) {
            return false; // array is full
        }
        categories[count] = newCategory;
        categoriesManaged++;
        return true;
    }

    // Admin-only behaviour: display all registered expense categories
    public void viewCategories(String[] categories, int count) {
        System.out.println("Available expense categories:");
        for (int i = 0; i < count; i++) {
            System.out.println("  " + (i + 1) + ". " + categories[i]);
        }
    }

    // Getter for the extra attribute
    public int getCategoriesManaged() {
        return categoriesManaged;
    }
}
