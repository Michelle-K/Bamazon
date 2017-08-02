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
  // Show all available items after the connection is made
  displayItems();
});

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
    
	buyItem();

});
}

function buyItem(){
 inquirer.prompt([
 	{
 		name: "number",
 		message: "What is the item ID of the product you would like to buy?",
 		validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
 	},
 	{
 		type: "input",
 		name: "units",
 		message: "How many units would you like to buy?",
 		validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
 	}

 	]).then(function(answers){
 		var query = connection.query("SELECT * FROM PRODUCTS WHERE item_id=?", [answers.number], function(err,res){
 			if (err) throw err;
 			
 			stockQuantity = parseInt(res[0].stock_quantity);
 			orderQuantity = parseInt(answers.units);
 			currentItemId = answers.number;
 			newQuantity = (stockQuantity-orderQuantity);
 			itemPrice = res[0].price;

 			
 			if(parseInt(answers.units) > parseInt(res[0].stock_quantity)){
 				console.log("Insufficient quantity!");
 				buyItem();
 			}

 			else{
 					updateItem(answers.number);
 			}
 		});

 	});
}
var stockQuantity;
var orderQuantity;
var newQuantity;
var currentItemId;
var itemPrice;

function updateItem(itemID){
	var query = connection.query("UPDATE products SET ? WHERE ?",
		[
		{
			stock_quantity: newQuantity
		},
		{
			item_id: itemID
		}


		], function(err,res){
			if (err) throw err;
		
			console.log("Your order total comes to $" + (orderQuantity * itemPrice) +". Thank you for shopping at Bamazom. Feel free to continue shopping.");
			displayItems();
		}
		);

}