package hackathon;

/**
 * Parent class for all people who use the system.
 * Admin is a special kind of User, so it inherits from this class.
 *
 * @author USER
 */
public class User {

    // Attributes (protected so child classes like Admin can use them)
    protected String username;
    protected String password;
    protected String fullName;

    // Constructor: runs when a new User object is created
    public User(String username, String password, String fullName) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
    }

    // Getter methods
    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getFullName() {
        return fullName;
    }

    // Setter methods
    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    // Displays the user's information (password hidden on purpose:
    // real systems never print passwords, even in a demo)
    public void displayDetails() {
        System.out.println("Username: " + username);
        System.out.println("Name: " + fullName);
        System.out.println("Role: Normal User");
    }

    // Simple login check: compares stored password with the one typed
    public boolean login(String enteredPassword) {
        return password.equals(enteredPassword);
    }
}
