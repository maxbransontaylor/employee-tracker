SELECT employee.id,employee.first_name,employee.last_name,CONCAT(manager.first_name," ", manager.last_name) AS managerName,role.title,role.salary,department.name AS department  
  FROM employee employee LEFT JOIN employee manager ON employee.manager_id=manager.id
 LEFT JOIN role ON employee.role_id = role.id
LEFT JOIN department ON role.department_id = department.id;