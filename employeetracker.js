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

function init() {
    inquirer.prompt(initialOption)
        .then((response) => {
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
                    console.log("Updating employee role");
                    break;
                case "Update Employee Manager":
                    console.log("Updating employee manager");
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

function viewAllEmployees() {
    console.log("\n");
    console.log("Viewing all employees...");
    console.log("\n");
    var query = "SELECT first_name, last_name, title, salary, department_name, manager_id FROM employee JOIN role ON role_id = role.id JOIN department ON department_id = department.id";
    connection.query(query, function(err, res) {
        if (err) throw err;
        console.table(res);
        init();
    })
}

function viewEmployeesByDepartment() {
    console.log("\n");
    console.log("Viewing employees by department...");
    console.log("\n");
    var query = "SELECT department_name FROM department";
    connection.query(query, function(err, departmentData) {
        if (err) throw err;
        var departments = departmentData.map(ele => ele.department_name);
        inquirer.prompt([{
                type: "list",
                name: "departmentChoice",
                message: 'What department would you like to view?',
                choices: departments
            }])
            .then((response) => {
                var departmentQuery = "SELECT first_name, last_name, title, salary FROM employee JOIN role ON role_id = role.id JOIN department ON department_id = department.id WHERE department.department_name = ?";
                connection.query(departmentQuery, response.departmentChoice, function(err, resp) {
                    if (err) throw err;
                    console.table(resp);
                    init();
                })
            })
    })
}


function removeEmployee() {
    var query = "SELECT first_name, last_name FROM employee";
    connection.query(query, function(err, res) {
        if (err) throw err;
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
                var employeeStringArray = response.employeeToRemove.split(" ");
                var deleteQuery = "DELETE FROM employee WHERE ? AND ?";
                connection.query(deleteQuery, [{ first_name: employeeStringArray[0] }, { last_name: employeeStringArray[1] }], function(err, resp) {
                    if (err) throw err;
                    console.log("\n");
                    console.log("Removed " + employeeStringArray[0] + " " + employeeStringArray[1]);
                    console.log("----------------------------------------")
                    init();
                })
            })
    })
}

function addEmployee() {
    console.log("\n");
    console.log("Adding Employee");
    console.log("\n");
    var query = "SELECT title FROM role";
    connection.query(query, function(err, roleData) {
        if (err) throw err;
        var roles = roleData.map(ele => ele.title);

        var allEmployeequery = "SELECT first_name, last_name FROM employee";
        connection.query(allEmployeequery, function(err, employeeList) {
            if (err) throw err;
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
                    console.log(response.employeeFirstName);
                    console.log(response.employeeLastName);
                    var managerToAdd = [];
                    managerToAdd = response.employeeManager.split(" ");

                    // get department ID
                    connection.query("SELECT * FROM role WHERE title = ?", response.employeeRole, function(err, roleName) {
                        if (err) throw err;
                        var roleId = roleName[0].id;
                        console.log(roleId);
                        connection.query("SELECT * FROM employee WHERE ?", [{ first_name: managerToAdd[0] }, { last_name: managerToAdd[1] }], function(err, managerData) {
                            if (err) throw err;
                            var managerId = managerData[0].id;
                            console.log(managerId);

                            connection.query("INSERT INTO employee SET ?", {
                                first_name: response.employeeFirstName,
                                last_name: response.employeeLastName,
                                role_id: roleId,
                                manager_id: managerId
                            }, function(err, insertResponse) {
                                if (err) throw err;
                                console.log(insertResponse.affectedRows);
                                init();

                            })
                        })
                    })
                })
        })
    })
}


welcome();
init();