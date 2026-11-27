package hackathon;

/**
 * Personal Budget and Expense Monitoring System - main program.
 *
 * Startup flow (plan section 5):
 *   1. Load data from text files
 *   2. Create the FinanceManager (one source of truth)
 *   3. Ask the user to log in
 *   4. Run the main menu until the user exits
 *   5. Save all data back to the text files
 *
 * @author USER
 */
public class Hackathon {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {

        // 1. Create the manager that owns all records
        FinanceManager fm = new FinanceManager();

        // 2. Load previously saved data (first run: files may not
        //    exist yet - loadAll handles that silently)
        FileManager fileMgr = new FileManager();
        fileMgr.loadAll(fm);

        // 3. Login (returns the User or Admin who logged in)
        Menu menu = new Menu(fm, fileMgr);
        menu.login();

        // 4. Run the main menu loop until the user chooses Exit
        menu.run();

        // (Data is saved inside the menu when the user exits or
        // chooses "Save Data", so nothing more is needed here.)
    }
}
