// Import and require mysql2
const inquirer = require("inquirer");
const mysql = require("mysql2");
require("console.table");

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "",
    database: "employees",
  },
  console.log(`Connected to the employee database.`)
);

function deleteEmployee() {
  db.query("SELECT * FROM employee", function (err, results) {
    const choices = results.map(({ id, first_name, last_name }) => {
      return {
        name: `${first_name} ${last_name}`,
        value: id,
      };
    });

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee would you like to remove?",
          choices: choices,
        },
      ])
      .then(({ employeeId }) => {
        db.query(
          `DELETE FROM employee WHERE id = ?`,
          employeeId,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.log(result);
            showOptions();
          }
        );
      });
  });
}

// Query database
function showEmployees() {
  db.query(
    `SELECT employee.id,employee.first_name,employee.last_name,CONCAT(manager.first_name," ", manager.last_name) AS managerName,role.title,role.salary,department.name AS department  
  FROM employee employee LEFT JOIN employee manager ON employee.manager_id=manager.id
 LEFT JOIN role ON employee.role_id = role.id
LEFT JOIN department ON role.department_id = department.id;`,
    function (err, results) {
      console.table(results);
      showOptions();
    }
  );
}

function addEmployee() {
  let managerChoices = [];
  let roleChoices = [];
  db.query(`SELECT * FROM role`, function (err, results) {
    roleChoices = results.map(({ id, title }) => {
      return {
        value: id,
        name: title,
      };
    });
    db.query(`SELECT * FROM employee`, (err, results) => {
      managerChoices = results.map(({ id, first_name, last_name }) => {
        return { name: `${first_name} ${last_name}`, value: id };
      });
      managerChoices.push({ name: "none", value: null });
      inquirer
        .prompt([
          {
            type: "list",
            name: "role",
            message: "What is the employee's role?",
            choices: roleChoices,
          },
          {
            type: "input",
            name: "first_name",
            message: "Enter employee's first name:",
          },
          {
            type: "input",
            name: "last_name",
            message: "Enter employee's last name:",
          },
          {
            type: "list",
            name: "manager",
            message: "Who is the employee's manager?",
            choices: managerChoices,
          },
        ])
        .then((answers) => {
          const sql = `INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)`;
          const params = [
            answers.first_name,
            answers.last_name,
            answers.role,
            answers.manager,
          ];
          db.query(sql, params, (err, result) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log(result);
            showOptions();
          });
        });
    });
  });
}
function updateEmployeeRole() {
  let employeeChoices = [];
  let roleChoices = [];
  db.query(`SELECT * FROM role`, function (err, results) {
    roleChoices = results.map(({ id, title }) => {
      return {
        value: id,
        name: title,
      };
    });
    db.query(`SELECT * FROM employee`, (err, results) => {
      employeeChoices = results.map(({ id, first_name, last_name }) => {
        return { name: `${first_name} ${last_name}`, value: id };
      });
      inquirer
        .prompt([
          {
            type: "list",
            name: "employee",
            message: "Which Employee would you like to update?",
            choices: employeeChoices,
          },
          {
            type: "list",
            name: "role",
            message: "What is the employee's new role?",
            choices: roleChoices,
          },
        ])
        .then((answers) => {
          const sql = `UPDATE employee SET role_id = ? WHERE id=?`;
          const params = [answers.role, answers.employee];
          db.query(sql, params, (err, result) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log(result);
            showOptions();
          });
        });
    });
  });
}
function showDepartments() {
  db.query(`SELECT * FROM department`, function (err, results) {
    console.table(results);
    showOptions();
  });
}
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "What is the name of the new department?",
      },
    ])
    .then(({ department }) => {
      const sql = `INSERT INTO department(name) VALUES (?)`;
      const params = department;
      db.query(sql, params, (err, result) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(result);
        showOptions();
      });
    });
}
function showRoles() {
  db.query(
    `SELECT role.id,role.title,role.salary,department.name AS department_name FROM role LEFT JOIN department ON role.department_id=department.id`,
    function (err, results) {
      console.table(results);
      showOptions();
    }
  );
}
function addRole() {
  db.query(`SELECT * FROM department`, function (err, results) {
    const departments = results.map(({ name, id }) => {
      return { name: name, value: id };
    });
    inquirer
      .prompt([
        { type: "input", name: "title", message: "What is this role's title?" },
        {
          type: "number",
          name: "salary",
          message: "What is the yearly salary for this role?",
        },
        {
          type: "list",
          name: "department",
          message: "Which department does this role fall under?",
          choices: departments,
        },
      ])
      .then((answers) => {
        const sql = `INSERT INTO role(title,salary,department_id) VALUES (?,?,?)`;
        const params = [answers.title, answers.salary, answers.department];
        db.query(sql, params, (err, result) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log(result);
          showOptions();
        });
      });
  });
}
function showOptions() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: [
          "View All Departments",
          "Add a Department",
          "View All Roles",
          "Add a New Role",
          "View All Employees",
          "Add an Employee",
          "Remove Employee",
          "Update an Employee Role",
          "Quit",
        ],
      },
    ])
    .then(({ choice }) => {
      switch (choice) {
        case "View All Departments":
          showDepartments();
          break;
        case "Add a Department":
          addDepartment();
          break;
        case "View All Roles":
          showRoles();
          break;
        case "Add a New Role":
          addRole();
          break;
        case "View All Employees":
          showEmployees();
          break;
        case "Remove Employee":
          deleteEmployee();
          break;
        case "Add an Employee":
          addEmployee();
          break;

        case "Update an Employee Role":
          updateEmployeeRole();
          break;
        default:
          process.exit();
      }
    });
}

showOptions();
