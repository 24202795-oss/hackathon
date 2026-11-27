package hackathon;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Stores the registered user accounts in users.txt and
 * creates the User/Admin objects from it.
 *
 * File format:
 *   users.txt    username|password|fullName|role
 * where role is "user" or "admin".
 *
 * @author USER
 */
public class UserStore {

    // Plain array + counter (project rules: no collections)
    private User[] users = new User[50];
    private int userCount = 0;

    // ===== LOADING =====

    // Reads users.txt into the array. If the file does not exist
    // (first run), a default user and admin are created instead.
    public void loadUsers() {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader("users.txt"));
        } catch (IOException e) {
            // No users.txt yet: create the two demo accounts
            addUser(new User("ali", "1234", "Ali bin Ahmad"));
            addUser(new Admin("admin", "admin", "System Administrator"));
            saveUsers();
            return;
        }

        try {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] data = line.split("\\|");
                // Format: username|password|fullName|role
                if (data.length < 4) {
                    continue; // skip malformed lines
                }
                if (data[3].equalsIgnoreCase("admin")) {
                    addUser(new Admin(data[0], data[1], data[2]));
                } else {
                    addUser(new User(data[0], data[1], data[2]));
                }
            }
            reader.close();
        } catch (IOException e) {
            System.out.println("Error reading users.txt: " + e.getMessage());
        }
    }

    // ===== SAVING (rewrites the whole file from the array) =====

    public boolean saveUsers() {
        try {
            PrintWriter output = new PrintWriter(new FileWriter("users.txt"));
            for (int i = 0; i < userCount; i++) {
                String role = (users[i] instanceof Admin) ? "admin" : "user";
                output.println(users[i].getUsername() + "|"
                        + users[i].getPassword() + "|"
                        + users[i].getFullName() + "|"
                        + role);
            }
            output.close();
            return true;
        } catch (IOException e) {
            System.out.println("Error saving users.txt!");
            return false;
        }
    }

    // ===== REGISTERING A NEW ACCOUNT =====

    // Business rules: username must not exist yet, fields not empty
    public boolean register(String username, String password,
                            String fullName, boolean asAdmin) {
        if (username == null || username.trim().isEmpty()
                || password == null || password.trim().isEmpty()
                || fullName == null || fullName.trim().isEmpty()) {
            return false;
        }
        if (findUser(username) != null) {
            return false; // username already taken
        }
        if (userCount >= users.length) {
            return false; // array full
        }
        if (asAdmin) {
            addUser(new Admin(username, password, fullName));
        } else {
            addUser(new User(username, password, fullName));
        }
        saveUsers();
        return true;
    }

    // ===== LOOKUP (used by login) =====

    public User findUser(String username) {
        for (int i = 0; i < userCount; i++) {
            if (users[i].getUsername().equalsIgnoreCase(username)) {
                return users[i];
            }
        }
        return null;
    }

    // View all accounts (admin function, plan section 11)
    public void displayAll() {
        System.out.println("\n--- REGISTERED USERS ---");
        for (int i = 0; i < userCount; i++) {
            users[i].displayDetails();
            System.out.println();
        }
        if (userCount == 0) {
            System.out.println("(no users registered)");
        }
    }

    private void addUser(User user) {
        if (userCount < users.length) {
            users[userCount] = user;
            userCount++;
        }
    }

    public int getUserCount() {
        return userCount;
    }
}
