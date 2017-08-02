var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');


// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  
});

function menu(){
inquirer.prompt([
  {
    type: 'list',
    name: 'menu',
    message: 'What do you want to do?',
    choices: [
      'View Products for Sale',
      'View Low Inventory',
      'Add to Inventory',
      'Add New Product'
    ]
  }
]).then(function (answers) {
  //console.log(JSON.stringify(answers, null, '  '));

	switch(answers.menu){
  		case ("View Products for Sale"):
	  		displayItems();
	  		break;

  		case ('View Low Inventory'):
  			viewLowInventory();
  			break;

  		case ('Add to Inventory'):
  			addToInventory();
  			break;

  		case ('Add New Product'):
  			addNewProduct();
  			break;
  	}

});
}

function displayItems(){
	connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    
    
    var table = new Table({
    	head: ['Item ID', 'Product Name', 'Department Name', 'Price($)', 'Stock Quantity'],
  		colWidths: [10, 30,30,10,30]
	});
    
    for (i = 0; i<res.length ; i++){
    	table.push(
    		[res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
		);
	}
	console.log(table.toString());
  menu();
});
}

function viewLowInventory(){
connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    
    
    var table = new Table({
      head: ['Item ID', 'Product Name', 'Department Name', 'Price($)', 'Stock Quantity'],
      colWidths: [10, 30,30,10,10]
  });
    
    for (i = 0; i<res.length ; i++){
      if (res[i].stock_quantity <= 5){
        table.push(
          [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
        );
      }
  }
  console.log(table.toString());
  menu();
});
}

function addNewProduct(){
  inquirer.prompt([
    {
      name: "productName",
      type: "input",
      message: "What is the name of the product you would like to add to the store?" 
    },
    {
      name: "departmentName",
      type: "input",
      message: "Department Name: " 
    },
    {
      name: "price",
      type: "input",
      message: "Price($): "
    },
    {
      name: "stock",
      type: "input",
      message: "Stock Quantity: "
    }

    ]).then(function(answers){
        connection.query("INSERT INTO products SET ?",
        {
          product_name : answers.productName,
          department_name : answers.departmentName,
          price : answers.price,
          stock_quantity : answers.stock
        },
        function(err){
          if (err) throw err;
          console.log("The product has been added to your inventory!");
          menu();
        }
          );
    });
}

var totalStock;
function addToInventory(){
  
  inquirer.prompt([
  {
    name : "whichItem",
    type : "input",
    message : "What is the Item ID of the product you would like to update?",
    validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
  },
  {
    name : "addProducts",
    type : "input",
    message : "How many would you like to add to the currenty stock quantity?",
    validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
  }
    ]).then(function(answers){
        var chosenProduct;
        
        connection.query("SELECT * FROM products", function(err, results){
          if (err) throw err;
          for(i = 0 ; i < results.length ; i++){
            if(results[i].item_id === parseInt(answers.whichItem)){
              chosenProduct = results[i].item_id;
              totalStock = results[i].stock_quantity + parseInt(answers.addProducts);
            
            }
            // else{
            //   console.log("No match found");
              
            //    console.log(results[i].item_id);
            //    console.log(answers.whichItem);
            // }
          }
        });
        connection.query("UPDATE products SET ? WHERE ?",
        [  
          {
            stock_quantity : totalStock
          },
          {
            item_id : answers.whichItem
          }
        ],function(error, results){
          if (error) throw error;
          console.log(results.affectedRows + "Item quanitity updated!");
          console.log(totalStock);
          console.log(chosenProduct);
          menu();
        }
          );
          
    });
}


menu();
