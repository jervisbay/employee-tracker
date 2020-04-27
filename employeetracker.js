const mysql = require("mysql");
const inquirer = require("inquirer");
const password = require("./env.js");
const cTable = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: password.password,
    database: "employee_tracker_db"
});

const initialOption = [{
    type: "list",
    name: "initialOption",
    message: "What would you like to do?",
    choices: ["View All Employees", "View Employees by Department", "View Employees by Manager", "Add an Employee", "Remove an Employee", "Update Employee Role", "Update Employee Manager", "Exit"],
}]

// displays pleasing interface beginning
function welcome() {
    console.log("\n")
    console.log("****************************************")
    console.log("----------------------------------------")
    console.log("\n")
    console.log(" Welcome to the Employee Manager System");
    console.log("\n")
    console.log("----------------------------------------")
    console.log("****************************************")
    console.log("\n")
};

// declare function to get action
function init() {
    inquirer.prompt(initialOption)
        .then((response) => {

            // define switch cases based on user input
            switch (response.initialOption) {
                case "View All Employees":
                    viewAllEmployees();
                    break;
                case "View Employees by Department":
                    viewEmployeesByDepartment();
                    break;
                case "View Employees by Manager":
                    console.log("Viewing employees by manager");
                    break;
                case "Add an Employee":
                    addEmployee();
                    break;
                case "Remove an Employee":
                    removeEmployee();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;
                case "Update Employee Manager":
                    updateEmployeeManager();
                    break;
                case "Exit":
                    console.log("Goodbye");
                    break;
                default:
                    console.log("Invalid Option");
                    break;
            }
        })
}

// declare function to view all employees
function viewAllEmployees() {
    console.log("\n");
    console.log("Viewing all employees...");
    console.log("\n");

    // joining the three databases to show all relevant information
    var query = "SELECT first_name, last_name, title, salary, department_name, manager_id FROM employee JOIN role ON role_id = role.id JOIN department ON department_id = department.id";
    connection.query(query, function(err, res) {
        if (err) throw err;

        // display response in table
        console.table(res);
        init();
    })
}

// declare function to view employees by department
function viewEmployeesByDepartment() {
    console.log("\n");
    console.log("Viewing employees by department...");
    console.log("\n");

    // query to get all departments in the department database
    var query = "SELECT department_name FROM department";
    connection.query(query, function(err, departmentData) {
        if (err) throw err;

        // map the query results into an array to be passed into the inquirer prompt
        var departments = departmentData.map(ele => ele.department_name);
        inquirer.prompt([{
                type: "list",
                name: "departmentChoice",
                message: 'What department would you like to view?',
                choices: departments
            }])
            .then((response) => {

                // query databases based on inquirer answer
                var departmentQuery = "SELECT first_name, last_name, title, salary FROM employee JOIN role ON role_id = role.id JOIN department ON department_id = department.id WHERE department.department_name = ?";
                connection.query(departmentQuery, response.departmentChoice, function(err, resp) {
                    if (err) throw err;

                    // display results in table and ask for desired action again
                    console.table(resp);
                    init();
                })
            })
    })
}

// declare function to remove employee
function removeEmployee() {

    // query employee database to get all current employees 
    var query = "SELECT first_name, last_name FROM employee";
    connection.query(query, function(err, res) {
        if (err) throw err;

        // push query results into an array to be passed into inquirer prompt
        var employeeArray = [];
        for (var i = 0; i < res.length; i++) {
            employeeArray.push(res[i].first_name + " " + res[i].last_name)
        }
        inquirer.prompt({
                type: "list",
                name: "employeeToRemove",
                message: "Who would you like to remove?",
                choices: employeeArray
            })
            .then((response) => {
                // split inquirer response into first name and last name
                var employeeStringArray = response.employeeToRemove.split(" ");

                // pass first name and last name into DELETE query
                var deleteQuery = "DELETE FROM employee WHERE ? AND ?";
                connection.query(deleteQuery, [{ first_name: employeeStringArray[0] }, { last_name: employeeStringArray[1] }], function(err, resp) {
                    if (err) throw err;
                    console.log("\n");
                    console.log("Removed " + employeeStringArray[0] + " " + employeeStringArray[1]);
                    console.log("----------------------------------------")

                    // ask for desired action again
                    init();
                })
            })
    })
}

// declare function to add an employee
function addEmployee() {
    console.log("\n");
    console.log("Adding Employee");
    console.log("\n");
    var query = "SELECT title FROM role";

    // query role database for all available roles and map into an array for use in an inquirer prompt below
    connection.query(query, function(err, roleData) {
        if (err) throw err;
        var roles = roleData.map(ele => ele.title);

        // query employee database for all current employees 
        var allEmployeequery = "SELECT first_name, last_name FROM employee";
        connection.query(allEmployeequery, function(err, employeeList) {
            if (err) throw err;

            // map query results into an array for use in an inquirer prompt below
            var employees = employeeList.map(elem => elem.first_name + " " + elem.last_name)
            employees.push("No Manager");
            inquirer.prompt([{
                        type: "input",
                        name: "employeeFirstName",
                        message: "What is the first name of the employee?",
                    },
                    {
                        type: "input",
                        name: "employeeLastName",
                        message: "What is the last name of the employee?",
                    },
                    {
                        type: "list",
                        name: "employeeRole",
                        message: "What is the employee's role?",
                        choices: roles
                    },
                    {
                        type: "list",
                        name: "employeeManager",
                        message: "Who is the employee's manager?",
                        choices: employees
                    },
                ])
                .then((response) => {

                    // split employee's manager into first name and last name
                    var managerToAdd = [];
                    managerToAdd = response.employeeManager.split(" ");

                    // get role ID based on selected role of the employee to be added
                    connection.query("SELECT * FROM role WHERE title = ?", response.employeeRole, function(err, roleName) {
                        if (err) throw err;
                        var roleId = roleName[0].id;

                        // get manager id based on manager's first name and last name
                        connection.query("SELECT * FROM employee WHERE ?", [{ first_name: managerToAdd[0] }, { last_name: managerToAdd[1] }], function(err, managerData) {
                            if (err) throw err;
                            var managerId = managerData[0].id;

                            // insert employee into database
                            connection.query("INSERT INTO employee SET ?", {
                                first_name: response.employeeFirstName,
                                last_name: response.employeeLastName,
                                role_id: roleId,
                                manager_id: managerId
                            }, function(err, insertResponse) {
                                if (err) throw err;
                                console.log(insertResponse.affectedRows);

                                // ask for desired action again
                                init();
                            })
                        })
                    })
                })
        })
    })
}

function updateEmployeeRole() {
    var query = "SELECT first_name, last_name FROM employee";
    connection.query(query, function(err, res) {
        if (err) throw err;
        var employeeArray = [];
        for (var i = 0; i < res.length; i++) {
            employeeArray.push(res[i].first_name + " " + res[i].last_name)
        }
        inquirer.prompt([{
                type: "list",
                name: "employeeRoleToUpdate",
                message: "Whose role would you like to update?",
                choices: employeeArray
            }, {
                type: "list",
                name: "newRole",
                message: "What role would you like to assign?",
                choices: ["Sales Lead", "Salesperson", "Lead Engineer", "Software Engineer", "Accountant", "General Counsel", "Lawyer"]
            }])
            .then((response) => {

                var firstNameToUpdate = response.employeeRoleToUpdate.split(" ")[0];
                var lastNameToUpdate = response.employeeRoleToUpdate.split(" ")[1];
                var updatedRole = response.newRole;

                connection.query("SELECT * FROM role WHERE title = ?", updatedRole, function(err, roleName) {
                    if (err) throw err;
                    var newRoleId = roleName[0].id;
                    console.log(newRoleId);
                    connection.query("SELECT * FROM employee WHERE ?", [{ first_name: firstNameToUpdate }, { last_name: lastNameToUpdate }], function(err, employeeData) {
                        if (err) throw err;
                        console.log(employeeData[0].id);

                        connection.query("UPDATE employee SET ? WHERE ?", [{ role_id: newRoleId }, { id: employeeData[0].id }], function(err, updateResponse) {
                            if (err) throw err;
                            console.log(firstNameToUpdate + " " + lastNameToUpdate + "\'s role updated");
                            init();
                        })
                    })
                })
            })
    })
}

function updateEmployeeManager() {
    var query = "SELECT first_name, last_name FROM employee";
    connection.query(query, function(err, res) {
        if (err) throw err;
        var employeeArray = [];
        for (var i = 0; i < res.length; i++) {
            employeeArray.push(res[i].first_name + " " + res[i].last_name)
        }
        inquirer.prompt([{
                type: "list",
                name: "employeeManagerToUpdate",
                message: "Which employee would you like to reassign a manager?",
                choices: employeeArray
            }, {
                type: "list",
                name: "newManager",
                message: "Who is the new manager for the employee?",
                choices: employeeArray
            }])
            .then((response) => {
                var employeeManagerToBeUpdated = response.employeeManagerToUpdate.split(" ");
                var newManager = response.newManager.split(" ");


                connection.query("SELECT * FROM employee WHERE ?", [{ first_name: newManager[0] }, { last_name: newManager[1] }], function(err, resp) {
                    if (err) throw err;
                    console.log(resp[0].id);
                })

                // connection.query("UPDATE employee SET ? WHERE ?", [{ manager_id: }, { first_name: employeeManagerToBeUpdated[0], last_name: employeeManagerToBeUpdated[1] }])
            })

    })
}



welcome();
init();