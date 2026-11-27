# Personal Budget and Expense Monitoring System

## Conversation Export

**Date:** 27 November 2026\
**Project track:** Fintech & Personal Finance --- Budget Spending and
Expense Monitoring\
**Development environment:** NetBeans\
**Java experience:** Beginner; explain every line\
**Project type:** Group project

------------------------------------------------------------------------

# 1. Original project requirements

The assignment asks the student to choose one of eight project tracks,
identify at least one UN Sustainable Development Goal (SDG), and explain
how the application addresses it.

The stated core requirements are:

-   Demonstrate course topics from Java Fundamentals (Week 1) through
    Classes (Week 10).
-   Use at least 10 Java classes.
-   Provide a text menu that reads input with `Scanner`.
-   Store objects in plain Java arrays, such as `Product[]`, with a
    separate integer counter for each array.
-   Use loops for operations such as searching, adding and deleting.
-   Do not use Java collections such as `ArrayList`, `LinkedList` or
    `HashMap` to store objects.
-   Save application data to `.txt` files and reload it when the program
    restarts.
-   Document file formats and save generated reports to a file.
-   Implement menus and business rules for every user role.
-   Use clear names, consistent indentation and comments for each class
    and key method.
-   Ensure the project compiles and runs in NetBeans or another IDE
    before submission.

# 2. Project choice

**Project title:** Personal Budget and Expense Monitoring System

The application is intended to help users: 1. Record income (allowance,
salary or part-time work). 2. Record daily expenses (food, transport,
shopping and entertainment). 3. Set monthly budgets. 4. Monitor spending
and remaining balance. 5. Receive warnings when approaching or exceeding
budgets. 6. Set savings goals. 7. Generate financial reports. 8. Save
and reload records using text files.

The suggested application is console-based and uses Java `Scanner`,
loops, arrays, classes, inheritance and file handling.

# 3. Research into similar applications

The earlier research identified these examples:

## 3.1 YNAB (You Need A Budget)

Common features described: - Create budgets. - Track spending by
category. - Set savings targets. - View reports. - Connect bank accounts
to import transactions.

Similarity: budget planning, expense tracking and savings goals.

Reference: [YNAB official features](https://www.ynab.com/)

## 3.2 Goodbudget

Common features described: - Divide money into spending categories or
envelopes. - Record income and expenses. - Monitor remaining money in
each category. - Track debt payments. - Generate income and spending
reports.

Similarity: category-based budgeting and remaining-budget monitoring.

Reference: [Goodbudget](https://goodbudget.com/)

## 3.3 Money Manager Expense & Budget (Realbyte)

Common features described: - Record daily income and expenses. -
Categorise transactions. - Set weekly and monthly budgets. - Display
financial statistics. - View spending history using a calendar. -
Generate reports.

Similarity: daily expense recording, budget limits and monthly reports.

Reference: [Realbyte](https://www.realbyte.co.kr/)

## 3.4 RinggitWise

The earlier research described it as a Malaysian personal finance
example, with features such as budgeting, savings goals, expense
tracking and local financial information. Verify the current app listing
and feature availability before using it as a formal reference.

## 3.5 Common features identified

  Core feature            YNAB   Goodbudget                       Money Manager   Proposed project
  --------------------- ------ ------------ ----------------------------------- ------------------
  Record income            Yes          Yes                                 Yes                Yes
  Record expenses          Yes          Yes                                 Yes                Yes
  Categorise expenses      Yes          Yes                                 Yes                Yes
  Set budgets              Yes          Yes                                 Yes                Yes
  Monitor balance          Yes          Yes                                 Yes                Yes
  Savings goals            Yes          Yes   Not established in the comparison                Yes
  Financial reports        Yes          Yes                                 Yes                Yes
  Budget warnings          Yes          Yes                                 Yes                Yes

This is a high-level comparison based on the earlier descriptions, not a
complete technical comparison of every app.

## 3.6 Recommended core modules

1.  **Income Management:** add, view, update and delete income records.
2.  **Expense Management:** record daily purchases and categorise
    expenses.
3.  **Budget Management:** set spending limits and monitor remaining
    budgets.
4.  **Savings Goals:** set savings targets and monitor progress.
5.  **Financial Reports:** calculate total income, expenses and savings.
6.  **Budget Alerts:** warn users when spending approaches or exceeds a
    limit.

# 4. SDG contribution

**SDG 12: Responsible Consumption and Production**

The application supports responsible spending by helping users: -
Identify how much they spend on food, shopping and entertainment. - Set
monthly spending limits. - Monitor spending habits. - Make more informed
financial decisions. - Plan savings rather than spending all available
money.

The earlier proposal linked the project particularly to Target 12.8,
which concerns information and awareness for sustainable development and
lifestyles. The contribution is indirect: the application promotes
responsible spending habits rather than directly measuring environmental
consumption.

Suggested proposal paragraph:

> Our project supports Sustainable Development Goal (SDG) 12:
> Responsible Consumption and Production. The Personal Budget and
> Expense Monitoring System encourages responsible financial behaviour
> by helping users monitor their daily expenses, manage their monthly
> budgets and identify unnecessary spending. Through financial reports
> and budget alerts, users can understand their spending habits and make
> better financial decisions. This application promotes responsible
> consumption by encouraging individuals to spend wisely, avoid
> excessive purchases and develop better money management habits.

Reference: [United Nations SDG 12](https://sdgs.un.org/goals/goal12)

# 5. How the application works

Basic process:

1.  User logs in.
2.  User chooses a function from the main menu.
3.  User manages income, expenses, budgets or savings.
4.  The program calculates totals, balance and budget status.
5.  Data is saved to text files and reloaded when the program restarts.

Example student finances:

  Description            Amount
  ------------------- ---------
  Monthly allowance     RM1,000
  Food                    RM250
  Transport               RM100
  Shopping                RM150
  Entertainment           RM100
  Total expenses          RM600
  Remaining balance       RM400

Calculations:

\[ `\text{Total Expenses}`{=tex}=250+100+150+100=RM600 \]

\[ `\text{Remaining Balance}`{=tex}=1000-600=RM400 \]

# 6. Suggested Java classes

The proposed system uses 13 classes:

    No. Class               Responsibility
  ----- ------------------- -------------------------------------------
      1 `Main`              Starts the application
      2 `User`              Stores user information
      3 `Admin`             Admin functions
      4 `Transaction`       Parent class for transactions
      5 `Income`            Stores income records
      6 `Expense`           Stores expense records
      7 `Category`          Stores expense categories
      8 `Budget`            Stores monthly budget information
      9 `SavingsGoal`       Manages savings targets
     10 `FinanceManager`    Manages arrays and financial calculations
     11 `Menu`              Displays menus and processes selections
     12 `FileManager`       Saves and loads text files
     13 `ReportGenerator`   Generates financial summaries and reports

An optional `InputValidator` class can be added if needed.

## 6.1 Inheritance relationships

``` text
           Transaction
                |
         --------------
         |            |
       Income       Expense


             User
              |
            Admin
```

-   `Income` inherits from `Transaction`.
-   `Expense` inherits from `Transaction`.
-   `Admin` inherits from `User`.

Other relationships: - `FinanceManager` manages income, expense, budget,
savings and category objects. - `FileManager` handles saving and
loading. - `ReportGenerator` calculates summaries. - `Menu` communicates
with the user.

# 7. Plain Java arrays and counters

The assignment prohibits `ArrayList`, `LinkedList` and `HashMap` for
storing objects. Use ordinary arrays:

``` java
Income[] incomes = new Income[100];
Expense[] expenses = new Expense[100];
Budget[] budgets = new Budget[50];
SavingsGoal[] goals = new SavingsGoal[50];

int incomeCount = 0;
int expenseCount = 0;
int budgetCount = 0;
int goalCount = 0;
```

The counters record how many objects are actually stored. For example,
an array may have capacity 100 while only three expenses have been
entered.

Adding an expense:

``` java
if (expenseCount < expenses.length) {

    expenses[expenseCount] = new Expense(
        "21/11/2026",
        "Lunch",
        15.00,
        "Food"
    );

    expenseCount++;
}
```

Displaying expenses:

``` java
for (int i = 0; i < expenseCount; i++) {
    expenses[i].displayDetails();
}
```

Deleting an expense requires shifting later elements to the left:

``` java
for (int i = position; i < expenseCount - 1; i++) {
    expenses[i] = expenses[i + 1];
}

expenses[expenseCount - 1] = null;
expenseCount--;
```

Expected operations include adding, displaying, searching, updating and
deleting records.

# 8. Menu design

Suggested main menu:

``` text
===== PERSONAL FINANCE SYSTEM =====

1. Dashboard
2. Income Management
3. Expense Management
4. Budget Management
5. Savings Goals
6. Financial Reports
7. Search Transactions
8. Save Data
9. Logout / Exit

Enter your choice:
```

Income submenu:

``` text
1. Add Income
2. View All Income
3. Search Income
4. Update Income
5. Delete Income
6. Back to Main Menu
```

Expense submenu:

``` text
1. Add Expense
2. View All Expenses
3. Search Expense
4. Update Expense
5. Delete Expense
6. Back to Main Menu
```

Budget submenu:

``` text
1. Set Monthly Budget
2. View Budget
3. Check Budget Status
4. Update Budget
5. Back to Main Menu
```

Savings submenu:

``` text
1. Create Savings Goal
2. View Savings Goals
3. Add Savings
4. Check Savings Progress
5. Back to Main Menu
```

Reports submenu:

``` text
1. Total Income
2. Total Expenses
3. Remaining Balance
4. Expense Breakdown by Category
5. Monthly Financial Summary
6. Back to Main Menu
```

Example menu skeleton:

``` java
Scanner input = new Scanner(System.in);
int choice;

do {
    System.out.println("\n===== MAIN MENU =====");
    System.out.println("1. Dashboard");
    System.out.println("2. Income Management");
    System.out.println("3. Expense Management");
    System.out.println("4. Budget Management");
    System.out.println("5. Savings Goals");
    System.out.println("6. Financial Reports");
    System.out.println("7. Search Transactions");
    System.out.println("8. Save Data");
    System.out.println("9. Exit");

    System.out.print("Enter your choice: ");
    choice = input.nextInt();

    switch (choice) {
        case 1:
            System.out.println("Dashboard");
            break;
        case 2:
            System.out.println("Income Management");
            break;
        case 3:
            System.out.println("Expense Management");
            break;
        case 4:
            System.out.println("Budget Management");
            break;
        case 5:
            System.out.println("Savings Goals");
            break;
        case 6:
            System.out.println("Financial Reports");
            break;
        case 7:
            System.out.println("Search Transactions");
            break;
        case 8:
            System.out.println("Saving data...");
            break;
        case 9:
            System.out.println("Thank you!");
            break;
        default:
            System.out.println("Invalid choice!");
    }

} while (choice != 9);
```

This is only the menu skeleton. Later, replace the print statements with
calls to methods in the other classes.

# 9. Financial calculations and business rules

## 9.1 Total income

\[
`\text{Total Income}`{=tex}=`\sum `{=tex}`\text{All Income Records}`{=tex}
\]

``` java
double totalIncome = 0;

for (int i = 0; i < incomeCount; i++) {
    totalIncome += incomes[i].getAmount();
}
```

## 9.2 Total expenses

\[
`\text{Total Expenses}`{=tex}=`\sum `{=tex}`\text{All Expense Records}`{=tex}
\]

``` java
double totalExpenses = 0;

for (int i = 0; i < expenseCount; i++) {
    totalExpenses += expenses[i].getAmount();
}
```

## 9.3 Remaining balance

\[
`\text{Balance}`{=tex}=`\text{Total Income}`{=tex}-`\text{Total Expenses}`{=tex}
\]

``` java
double balance = totalIncome - totalExpenses;
```

## 9.4 Budget monitoring

\[
`\text{Remaining Budget}`{=tex}=`\text{Budget Limit}`{=tex}-`\text{Expenses}`{=tex}
\]

Example: monthly food budget RM300, food expenses RM250, remaining food
budget RM50.

``` java
if (totalFoodExpenses > foodBudget) {
    System.out.println("WARNING! Budget exceeded!");
} else {
    System.out.println("You are within your budget.");
}
```

Suggested warning levels: - Below 80%: budget is under control. - At
80%: approaching budget limit. - At 100%: budget limit reached. - Above
100%: budget exceeded.

## 9.5 Savings progress

\[ `\text{Savings Progress}`{=tex}=
`\frac{\text{Current Savings}}{\text{Target Savings}}`{=tex}`\times100`{=tex}%
\]

Example: target RM2,000, current savings RM800, progress 40%, remaining
RM1,200.

## 9.6 Business rules

  Function        Rule
  --------------- -----------------------------------------------
  Add income      Amount must be greater than RM0
  Add expense     Amount must be greater than RM0
  Add expense     Category must be valid
  Set budget      Budget must be greater than RM0
  Delete record   Record must exist
  Update record   Only existing records can be updated
  Savings goal    Target must be greater than RM0
  Budget alert    Alert when spending reaches or exceeds budget
  Balance         Recalculate after transaction changes

Calculate balances from actual transaction records to avoid inconsistent
financial data.

# 10. Text file handling

Suggested files:

``` text
PersonalFinanceSystem/
    users.txt
    income.txt
    expenses.txt
    budgets.txt
    savings.txt
```

Example `expenses.txt`:

``` text
21/11/2026|Lunch|15.00|Food
21/11/2026|Bus ticket|3.00|Transport
21/11/2026|Movie|20.00|Entertainment
```

Format:

``` text
Date | Description | Amount | Category
```

Saving example:

``` java
import java.io.*;

public void saveExpenses(Expense[] expenses,
                         int expenseCount) {

    try {
        PrintWriter output = new PrintWriter(
            new FileWriter("expenses.txt")
        );

        for (int i = 0; i < expenseCount; i++) {
            output.println(
                expenses[i].getDate() + "|" +
                expenses[i].getDescription() + "|" +
                expenses[i].getAmount() + "|" +
                expenses[i].getCategory()
            );
        }

        output.close();
        System.out.println("Expenses saved!");

    } catch (IOException e) {
        System.out.println("Error saving expenses!");
    }
}
```

Loading logic: 1. Open `expenses.txt`. 2. Read each line. 3. Split the
line using `split("\\|")`. 4. Convert the amount to `double`. 5. Create
an `Expense` object. 6. Store it in the array. 7. Increase
`expenseCount`.

Example:

``` java
String[] data = line.split("\\|");

String date = data[0];
String description = data[1];
double amount = Double.parseDouble(data[2]);
String category = data[3];

expenses[expenseCount] = new Expense(
    date, description, amount, category
);

expenseCount++;
```

Check array capacity and handle missing or invalid files. Use
`new FileWriter("expenses.txt")` to rewrite the current records. Use
`new FileWriter("expenses.txt", true)` only when appending. Avoid
appending repeatedly when updates and deletions are supported, because
this can create duplicate or outdated records.

Recommended approach: load all records at startup and save the complete
current arrays after changes or when exiting.

# 11. User roles

Two suggested roles:

  Function                     Normal User   Admin
  --------------------------- ------------- -------
  Login                            Yes        Yes
  View dashboard                   Yes        Yes
  Add income                       Yes        No
  Manage expenses                  Yes        No
  Set personal budget              Yes        No
  Manage savings goals             Yes        No
  View personal reports            Yes        No
  Manage expense categories        No         Yes
  View system users                No         Yes
  Manage system categories         No         Yes

For a classroom project, login can be simple. The application does not
need real banking authentication or bank connections.

# 12. Testing plan

  Test                   Input                   Expected result
  ---------------------- ----------------------- ----------------------------
  Add income             RM1,000                 Income recorded
  Add expense            RM50                    Expense recorded
  Add negative expense   -RM20                   Invalid amount
  Search expense         Food                    Matching expense displayed
  Delete expense         Existing record         Record deleted
  Set budget             RM300                   Budget saved
  Spend RM250            Budget RM300            RM50 remaining
  Spend RM350            Budget RM300            Budget exceeded warning
  Restart application    Previously saved data   Data loaded
  Invalid menu           Choice 15               Invalid choice message

Also test empty records, nonexistent records, full arrays, missing files
and non-numeric input.

# 13. Development roadmap

1.  Project planning --- title, objectives, users, menu and data.
2.  Java class creation --- classes, constructors, getters, setters and
    inheritance.
3.  Array implementation --- arrays, counters, adding and displaying.
4.  CRUD operations --- searching, updating and deleting.
5.  Financial calculations --- income, expenses, balance, budget and
    savings.
6.  Menu development --- `Scanner`, switch statements and validation.
7.  File handling --- save and load `.txt` records.
8.  Final testing --- compile, run and test all features.
9.  Documentation --- explain classes, methods, file formats and
    screenshots.

Suggested coding order:

1.  `Transaction.java`
2.  `Income.java`
3.  `Expense.java`
4.  `User.java`
5.  `Admin.java`
6.  `Category.java`
7.  `Budget.java`
8.  `SavingsGoal.java`
9.  `FinanceManager.java`
10. `FileManager.java`
11. `ReportGenerator.java`
12. `Menu.java`
13. `Main.java`

# 14. Stage 1 project proposal

## Introduction

The Personal Budget and Expense Monitoring System is a Java-based
application designed to help individuals manage their personal finances
effectively. Many people, especially students, find it difficult to
control their spending because they do not keep track of their daily
expenses or plan their monthly budgets.

This application allows users to record their income, monitor daily
expenses, set monthly budgets and manage personal savings goals. It also
provides financial summaries and budget alerts to help users understand
their spending habits.

The system will be developed using Java programming concepts, including
classes, objects, inheritance, arrays, loops, methods and text file
handling. All financial records will be stored in text files so that
users can access their information even after restarting the
application.

## Problem statement

1.  Many individuals do not have a clear understanding of how much money
    they spend daily.
2.  Without proper budgeting, users may spend more than their monthly
    allowance or income.
3.  Keeping financial records manually can be inconvenient and may
    result in missing or inaccurate information.
4.  Users may struggle to identify unnecessary spending and save money
    for future needs.

Therefore, a simple financial management system is needed to help users
record transactions, monitor their expenses and manage their budgets
more effectively.

## Objectives

1.  To develop a Java-based system that allows users to record and
    manage their income and expenses.
2.  To provide budget monitoring features that help users control their
    monthly spending.
3.  To calculate financial information such as total income, total
    expenses and remaining balance.
4.  To provide savings goal tracking and financial reports.
5.  To store and retrieve financial records using text files.

## Scope

The system focuses on personal financial management.

Target users: - Students - Working individuals - People who want to
monitor their personal spending

Main functions: 1. User login and account management. 2. Income
recording and management. 3. Daily expense recording and management. 4.
Monthly budget setting and monitoring. 5. Savings goal management. 6.
Financial reports and summaries. 7. Searching, updating and deleting
records. 8. Saving and loading data through text files.

Limitations: - Console-based Java program. - No connection to real bank
accounts. - No online transactions or money transfers. - Users enter
financial information manually.

# 15. Stage 2 system design

## UML class diagram

``` mermaid
classDiagram
    Transaction <|-- Income
    Transaction <|-- Expense
    User <|-- Admin

    Main --> Menu
    Menu --> FinanceManager
    Menu --> ReportGenerator
    FinanceManager --> Income
    FinanceManager --> Expense
    FinanceManager --> Budget
    FinanceManager --> SavingsGoal
    FinanceManager --> Category
    FileManager --> FinanceManager
    ReportGenerator --> FinanceManager

    class Transaction {
        -String date
        -String description
        -double amount
        +getAmount() double
        +displayDetails() void
    }

    class Income {
        -String incomeSource
    }

    class Expense {
        -String category
    }

    class User {
        -String username
        -String password
    }

    class Admin {
        +manageCategories() void
    }

    class FinanceManager {
        -Income[] incomes
        -Expense[] expenses
        -int incomeCount
        -int expenseCount
        +addIncome() void
        +addExpense() void
        +calculateBalance() double
    }

    class Budget
    class SavingsGoal
    class Category
    class Menu
    class FileManager
    class ReportGenerator
    class Main
```

## Flowchart

``` mermaid
flowchart TD
    A([Start]) --> B[Load data from text files]
    B --> C[Display login menu]
    C --> D{Login successful?}
    D -- No --> C
    D -- Yes --> E[Display main menu]
    E --> F{User selection}
    F --> G[Income Management]
    F --> H[Expense Management]
    F --> I[Budget Management]
    F --> J[Savings Goals]
    F --> K[Financial Reports]
    G --> E
    H --> E
    I --> E
    J --> E
    K --> E
    E --> L{Exit?}
    L -- No --> F
    L -- Yes --> M[Save data to text files]
    M --> N([End])
```

# 16. Stage 3: Java coding --- Part 1

The user confirmed: - IDE: NetBeans. - Java level: Beginner; explain
every line. - Project type: Group project.

The development approach is to create one class at a time, understand
it, run it and test it before moving forward.

## Step 1: Create the NetBeans project

1.  Open NetBeans.
2.  Click File.
3.  Select New Project.
4.  Choose Java with Ant → Java Application (or the equivalent Java
    Application option).
5.  Click Next.
6.  Set the project name to `PersonalFinanceSystem`.
7.  Set the package name to `personalfinancesystem`.
8.  Create `personalfinancesystem.Main` or create the main class
    manually.
9.  Click Finish.

For each new class: 1. Right-click `personalfinancesystem`. 2. Select
New. 3. Select Java Class. 4. Enter the class name. 5. Click Finish.

Suggested folder structure:

``` text
PersonalFinanceSystem
└── Source Packages
    └── personalfinancesystem
        ├── Main.java
        ├── User.java
        ├── Admin.java
        ├── Transaction.java
        ├── Income.java
        ├── Expense.java
        ├── Category.java
        ├── Budget.java
        ├── SavingsGoal.java
        ├── FinanceManager.java
        ├── Menu.java
        ├── FileManager.java
        └── ReportGenerator.java
```

## Step 2: Create `Transaction.java`

A transaction is a financial record. Income and expenses both have: -
Date - Description - Amount

Instead of writing these variables separately in both child classes,
create a parent class called `Transaction`.

Create a Java class named `Transaction` inside the
`personalfinancesystem` package.

### Transaction.java

``` java
package personalfinancesystem;

public class Transaction {

    // Attributes
    protected String date;
    protected String description;
    protected double amount;

    // Constructor
    public Transaction(String date, String description,
                       double amount) {

        this.date = date;
        this.description = description;
        this.amount = amount;
    }

    // Getter methods
    public String getDate() {
        return date;
    }

    public String getDescription() {
        return description;
    }

    public double getAmount() {
        return amount;
    }

    // Setter methods
    public void setDate(String date) {
        this.date = date;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    // Display transaction details
    public void displayDetails() {

        System.out.println("Date: " + date);
        System.out.println("Description: " + description);
        System.out.println("Amount: RM" + amount);

    }
}
```

### Explanation

**Package declaration**

``` java
package personalfinancesystem;
```

This tells Java that the class belongs to the `personalfinancesystem`
package. All project classes should use the same package declaration.

**Class declaration**

``` java
public class Transaction {
```

-   `public` means other classes can access the class.
-   `class` declares a class.
-   `Transaction` is the class name.

A class is a blueprint for creating objects.

**Attributes**

``` java
protected String date;
protected String description;
protected double amount;
```

  Variable        Data type   Example
  --------------- ----------- ----------------
  `date`          String      `"26/11/2026"`
  `description`   String      `"Lunch"`
  `amount`        double      `15.00`

`protected` allows child classes such as `Income` and `Expense` to
access these attributes.

**Constructor**

``` java
public Transaction(String date, String description,
                   double amount) {

    this.date = date;
    this.description = description;
    this.amount = amount;
}
```

A constructor initialises an object when it is created.

Example:

``` java
Transaction t1 = new Transaction(
    "26/11/2026",
    "Lunch",
    15.00
);
```

`this.amount` refers to the attribute belonging to the current object.
`amount` refers to the parameter received by the constructor.

**Getter method**

``` java
public double getAmount() {
    return amount;
}
```

A getter retrieves the value stored in an attribute. For example:

``` java
System.out.println(t1.getAmount());
```

Output:

``` text
15.0
```

**Setter method**

``` java
public void setAmount(double amount) {
    this.amount = amount;
}
```

A setter changes an existing attribute. For example:

``` java
t1.setAmount(20.00);
```

**Display method**

``` java
public void displayDetails() {

    System.out.println("Date: " + date);
    System.out.println("Description: " + description);
    System.out.println("Amount: RM" + amount);

}
```

This method displays all information stored in the transaction object.
`void` means the method performs an action but does not return a value.

## Step 3: Test `Transaction.java`

Open `Main.java` and replace its contents with:

``` java
package personalfinancesystem;

public class Main {

    public static void main(String[] args) {

        // Create a Transaction object
        Transaction t1 = new Transaction(
            "26/11/2026",
            "Lunch",
            15.00
        );

        // Display transaction details
        System.out.println("TRANSACTION DETAILS");
        t1.displayDetails();

        // Update transaction amount
        t1.setAmount(20.00);

        // Display updated amount
        System.out.println("\nUPDATED TRANSACTION");
        t1.displayDetails();

    }
}
```

Explanation: 1. `Transaction t1` declares a reference variable named
`t1`. 2. `new Transaction(...)` creates a new object and calls the
constructor. 3. `t1.displayDetails()` calls the display method. 4.
`t1.setAmount(20.00)` changes the amount from RM15.00 to RM20.00. 5.
Calling `displayDetails()` again displays the updated information.

In NetBeans: 1. Save both files. 2. Right-click `Main.java`. 3. Select
Run File (or press Shift + F6). 4. Check the Output window.

Expected output:

``` text
TRANSACTION DETAILS
Date: 26/11/2026
Description: Lunch
Amount: RM15.0

UPDATED TRANSACTION
Date: 26/11/2026
Description: Lunch
Amount: RM20.0
```

If the output matches, the first class is working.

## Step 4: Check understanding

Three practice questions were provided:

1.  What is the purpose of a constructor?
    -   Correct answer: To initialise an object.
2.  What does `this.amount` refer to?
    -   Correct answer: The current object's amount attribute.
3.  Which method changes the transaction amount?
    -   Correct answer: `setAmount()`.

## Step 5: Next coding task

The next classes to create are: 1. `Income.java` 2. `Expense.java`

Concepts to learn: - Inheritance. - `extends`. - `super()`. - How child
classes inherit attributes from their parent. - How to create and test
income and expense objects.

For the group project, keep all classes in the same package and agree on
variable and method names before different members code separate
classes. This helps prevent integration errors.

------------------------------------------------------------------------

# 17. Current project status and next action

**Current stage:** Stage 3, Part 1 --- `Transaction.java`.

**User's confirmed setup:** - NetBeans IDE. - Beginner Java level. -
Group project.

**Immediate task:** 1. Create `Transaction.java` using the code above.
2. Replace `Main.java` with the test program. 3. Run `Main.java` in
NetBeans. 4. Confirm whether the expected output appears or share a
screenshot of any error.

**Next lesson:** Create `Income.java` and `Expense.java`, with a
beginner-friendly explanation of inheritance and `super()`.
