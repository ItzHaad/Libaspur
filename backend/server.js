const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "Col61513",
  database: "grp16_website",
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const name = req.body.name;
  const address = req.body.address;
  const number = req.body.number;
  const update_key = 0;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    db.query(
      "INSERT INTO customer (cust_id, password,email_id,name,house_adress,phone,update_key) VALUES (?,?,?,?,?,?,?)",
      [username, hash, email, name, address, number, update_key],
      (err, result) => {
        if (err) {
          console.log(err);
          res.send({ message: "Registration unsuccessful, an error occured" });
        }
        res.send({ message: "Registered successfully" });
      }
    );
  });
});

app.get("/loginadmin", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/loginadmin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM store_admin WHERE ID = ?;",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.user = result;
            console.log(req.session.user);
            res.send({ message: "Welcome Admin" });
          } else {
            res.send({ message: "Wrong username/password combination!" });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
});

app.post("/changepassword", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const newpassword = req.body.newpassword;

  db.query(
    "SELECT * FROM customer WHERE email_id = ?;",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      bcrypt.hash(newpassword, saltRounds, (err, hash) => {
        if (err) {
          console.log(err);
        }

        if (result.length > 0) {
          db.query(
            "UPDATE customer SET password= ? WHERE email_id= ?;",
            [hash, username],
            (err, result) => {
              if (err) {
                console.log("error occured");
              } else {
                console.log("notjing");
              }
            }
          );
          res.send({ message: "Successfully changes" });
        } else {
          res.send({ message: "User doesn't exist" });
        }
      });
    }
  );
});

app.get("/logincustomer", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});
app.post("/logincustomer", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM customer WHERE cust_id = ?;",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.user = result;
            console.log(req.session.user);
            res.send({ message: "Welcome customer" });
          } else {
            res.send({ message: "Wrong username/password combination!" });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
});

app.post("/addprod", (req, res) => {
  const productname = req.body.prodname;
  const price = req.body.prodprice;
  const stock = req.body.prodstock;
  const productcategory = req.body.prodcat;
  const product_id = req.body.prodid;
  const productimage = req.body.prodimg;
  const update_key = 0;
  const active_bit = 1;

  db.query(
    "INSERT INTO product (product_id, product_name , price , product_image ,category,update_key ,active_bit) VALUES (?,?,?,?,?,?,?)",
    [
      product_id,
      productname,
      price,
      productimage,
      productcategory,
      update_key,
      active_bit,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({
          message: "Product addition unsuccessful, an error occured",
        });
      }
  
      res.send({ message: "Product added successfully" });
    }
  );
  db.query(
    "INSERT INTO inventory (product_id, quantity,category,update_key,active_bit) VALUES (?,?,?,?,?)",
    [product_id, stock, productcategory, update_key, active_bit],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({
          message: "Product addition unsuccessful, an error occured",
        });
      }
      // res.send({ message: "Product added successfully" });
    }
  );
});

app.post("/removeprod", (req, res) => {
  const product_id = req.body.prodid;
  const update_key = 0;
  const active_bit = 0;

  db.query(
    "UPDATE inventory SET update_key=?, active_bit=? WHERE product_id=?",
    [update_key, active_bit, product_id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ message: "Product removal unsuccessful, an error occured" });
      }

    }
  );

  db.query(
    "UPDATE product SET update_key=?, active_bit=? WHERE product_id=?",
    [update_key, active_bit, product_id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ message: "Product removal unsuccessful, an error occured" });
      }

    }
  );
});


app.post("/modprod", (req, res) => {
  console.log('In mod prod')
  const productname = req.body.prodname;
  const price = req.body.prodprice;
  const stock = req.body.prodstock;
  const productcategory = req.body.prodcat;
  const product_id = req.body.prodid;
  const productimage = req.body.prodimg;
  const update_key = 1;
  const active_bit = 1;

  db.query(
    "UPDATE product SET product_name=? , price=? , product_image=? ,category=?,update_key=? ,active_bit=? WHERE product_id=?",
    [
      productname,
      price,
      productimage,
      productcategory,
      update_key,
      active_bit,
      product_id,
    ],
    (err, result) => {
      
      if (err) {
        console.log('hello2')
        console.log(err);
        res.send({
          message: "Product Modification unsuccessful, an error occured",
        });
      }
      //res.send({ message: "Product modified successfully" });
    }
  );
  db.query(
    
    "UPDATE inventory SET quantity=?,category=?,update_key=?,active_bit=? WHERE product_id=?",
    [stock, productcategory, update_key, active_bit, product_id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({
          message: "Product modification unsuccessful, an error occured",
        });
      }
      //res.send({ message: "Product modified successfully" });
    }
  );
});

app.post("/homepage", (req, res) => {
  db.query("select product_image from product where active_bit=1", (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.post("/addcat", (req, res) => {
  const categoryname = req.body.category;
  const update_key = 0;
  const active_bit = 1;

  db.query(
    "INSERT INTO category ( category_name, update_key, active_bit) VALUES (?,?,?)",
    [categoryname, update_key, active_bit],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({
          message: "Category addition unsuccessful, an error occured",
        });
      }
      res.send({ message: "Category added successfully" });
    }
  );
});

app.get("/checkout", (req, res) => {
  res.send("Done!");
  // if (req.session.user) {
  //   res.send({ loggedIn: true, user: req.session.user });
  // } else {
  //   res.send({ loggedIn: false });
  // }
});

//( cust_id varchar(200) Primary Key, product_id varchar(255),order_id varchar(255), quantity varchar(255),data varchar(255),total_cost double ,update_key int,active_bit int)"
app.post("/checkout", (req, res) => {
  // const username = req.body.username;   //same variable names which we'll use in front end so it fetches them from front end
  // const productid = req.body.productid;
  // const orderid=req.body.orderid
  // const quantity=req.body.quantity
  // const data=req.body.data  //actually means date, but spelling mistake in schema table so followed it
  // const totalcost=req.body.totalcost
  // const update_key=0
  // const active_bit=1

  //appending order history
  const { prod_id} = req.body.product_id;
  db.query(
    `SELECT * FROM shopping_cart WHERE product_id=?`,
    [prod_id], 
    (err, result) => {
      
    console.log(result)

    db.query(
      "INSERT INTO order_history (cust_id, shoppingcart_id, product_id, order_id, quantity, NOW(), total_cost,update_key, active_bit) VALUES (?,?,?,?,?,?,?,?)",
      [result.cust_id, result.shoppingcart_id, result.product_id, orderid, result.quantity, result.data, result.total_cost, result.update_key, result.active_bit],
      (err, result) => {
        if (err){
        console.log(err);
        res.send({message:"Order could not be placed"})

        }
      }
      );

      //subtracting from inventory
      //accessing quantity of product in inventory and doing minus 1
      const newquantity = 0;
      db.query(
        "SELECT quantity FROM inventory WHERE product_id = ?;",
        result.product_id,
        (err, result) => {
          if (err) {
            res.send({ err: err });
          }
          newquantity = result - 1;
        }
      );
      //updating old value in database to new one
      db.query(
        "UPDATE inventory SET quantity = ? WHERE product_id = ?;"[
          (newquantity, result.product_id)
        ]
      );

      //making shopping cart inactive since it is now empty because order has been shipped

      db.query(
        "SELECT active_bit FROM shopping_cart WHERE shoppingcart_id = ?;",
        result.shoppingcart_id,
        (err, result) => {
          if (err) {
            res.send({ err: err });
          }
          result.active_bit = 0;
        }
        
      );  
      });   
    
});

app.get('/stock', (req, res) => {
  console.log('coming here')
  db.query("SELECT product_id,quantity FROM inventory where quantity<5;",
    (err, result) => {
      if (err) {
        console.log('no')
        res.send({ message: err });
      }
      if (result.length > 0) {
        console.log('yes')
          res.send({result})
          req.session.user = result;
          console.log(result);
      }
    }
  )
});


app.post('/observestock', (req, res) => {
  console.log('coming here')
  const product_id = req.body.prodid;


  db.query("SELECT product_id,quantity FROM inventory where product_id=?;",
    [product_id],
    (err, result) => {
      if (err) {
        console.log('no')
        res.send({ message: err });
      }
      if (result.length > 0) {
        // console.log('yes')
          res.send({result})
          req.session.user = result;
          console.log(result);
      }
    }
  )
});




app.get('/sales', (req, res) => {  //sales report
  db.query("SELECT date,sum(amount)as total FROM sales group by date;",
    (err, result) => {
      if (err) {
        console.log('no')
        res.send({ message: err });
      }
      if (result.length > 0) {
        console.log('yes')
          res.send({result})
          req.session.user = result;
          console.log(result);
      }
    }
  )
});







//Add to cart function
app.post("/addtocart", (req, res) => {
  const { product_name } = req.body.product_name;
  const { price } = req.body.price;
  db.query(
    "INSERT INTO shopping_cart ( shoppingcart_id, cust_id, product_id, quantity,total_cost,update_key,active_bit) VALUES (?,?,?,?,?,?,?)",
    [0, 0, product_name, 1, price, 0, 1],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({
          message: "Product addition unsuccessful, an error occured",
        });
      }
      res.send({ message: "Product added successfully" });
    }
  );
});

app.post("/viewcart", (req, res) => {
  try {
    db.query(
      "select price,product_id from shopping_cart",
      (err, result) => {
        if (err) {
          console.log("error in fetching cart items");
          console.log({ err: err });
        }
        // console.log(result);
        console.log("Successfully fetched cart items")
        res.send(result);
      }
    );
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});





//Send cart data to cart page
app.post("/cart_gallery", (req, res) => {
  try {
    db.query("select product_id from cart where active_bit=1", (err, result) => {
      if (err) {
        console.log({ err: err });
      }
      // console.log(result);
      var arr = [];
      for (var i = 0; i < result.length; i++) {
        arr.push(result[i]);
      }
      res.send({ result: arr });
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});



app.post("/gallery", (req, res) => {
  try {
    db.query(
      "select product_image,product_name,price from product where active_bit=1",
      (err, result) => {
        if (err) {
          console.log({ err: err });
        }
        // console.log(result);

        res.send(result);
      }
    );
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.post("/search", (req, res) => {
  const { searchData } = req.body;
  // console.log("------------------", searchData);
  // res.send("Hello");
  // const search = req.body.search;
  db.query(
    "SELECT product_image,product_name,price FROM product WHERE category=? and active_bit=1",
    [searchData],
    (err, result) => {
      if (err) {
        console.log(err);
      }

      res.send(result);
   }
  );
});



app.listen(3002, () => {
  console.log("running server");
});
