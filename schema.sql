DROP DATABASE IF EXISTS employee_tracker_db;

CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE table department (
id INT NOT NULL AUTO_INCREMENT,
department_name VARCHAR(30) NOT NULL,
PRIMARY KEY (id)
);

CREATE table employee (
id int NOT NULL AUTO_INCREMENT,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INT NOT NULL,
manager_id INT,
PRIMARY KEY (id)
);

CREATE table role (
id INT NOT NULL AUTO_INCREMENT,
title VARCHAR(30) NOT NULL,
salary DECIMAL(10,2) NOT NULL,
department_id INT NOT NULL,
PRIMARY KEY (id)
);

INSERT INTO role (title, salary, department_id)
VALUES
("Sales Lead", 100000, 1),
("Salesperson", 80000, 1),
("Lead Engineer", 150000, 2),
("Software Engineer", 125000, 2),
("Accountant", 125000, 3),
("General Counsel", 250000, 4),
("Lawyer", 180000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("John", "Doe", 3, 1),
("Mike", "Chan", 2, 2),
("Ashley", "Rodriguez", 1, 2),
("Ron", "Erlih", 1, 1),
("Harrison", "Fung", 1, 4),
("Robert", "Han", 3, 4),
("Simon", "Kong", 2, 4),
("Wayne", "Sun", 4, 4);

INSERT INTO department (department_name)
VALUES
("Sales"),
("Engineering"),
("Finance"),
("Legal");







