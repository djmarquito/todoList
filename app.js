//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

// Render.com port variable:
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Marcos:"+process.env.MONGO_PASS+"@cluster0.nsch4xu.mongodb.net/todolistDB");

// mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const Item1 = new Item ({
  name: "Welcome to your todo list!"
});

const Item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const Item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
name: String, //name
items: [itemsSchema] //array of items
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if (err){console.log(err);
      }else{
        console.log("Succesfully saved all default items to DB.");
      }
    });
    res.redirect("/");
     }else{
     res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.post("/", function(req, res){
const itemName = req.body.newItem;
const listName = req.body.list;
const item = new Item({
  name: itemName
});

if (listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name: listName}, function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
 }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function (err){
    if (!err){console.log("Succesfully deleted something!");
    res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if (!err){
      res.redirect("/" + listName);
    }
  });
 }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

  app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function (err, foundList){
  if (!err){
    if (!foundList){
        //console.log("Doesn't exist");
        //Create a new list
        const list = new List({
        name: customListName,
        items: defaultItems
      });
  list.save();
  res.redirect("/"+customListName);
    } else {
      // console.log("Exists");
      //Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});
});

app.get("/about", function(req, res){
  res.render("about");
});

// let port = process.env.PORT;
// if (port == null || port == ""){
//   port = 3000;
// }

//Render.com code:
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});

// heroku code NOT FREE anymore!
// app.listen(port, function() {
//   console.log("Server has started succesfully");
// });
