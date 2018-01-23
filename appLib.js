const User = require('./src/user.js');
const Todo = require('./src/todo.js');


const toHtmlParagraph = function(paraId,innerText,buttonId,onClickFunc,buttonName){
  return `<h1 id="${paraId}">${innerText} ${getButton(buttonId,onClickFunc,buttonName)}</h1>`
}

const getButton = function(id,onclickFunction,buttonName){
  return `<button id="${id}" onclick="${onclickFunction}()">${buttonName}</button>`
}

const toHtmlItem = function(item){
  let checkboxStatus = '';
  if(item.status) checkboxStatus = 'checked';
  return `<h3><input type='checkbox' onclick="changeStatus()" id="${item.getId()}" ${checkboxStatus}> 
  <span>${item.getItem()}</span>${getButton(item.getId(),'editItem','Edit')}${getButton(item.getId(),'deleteItem','Delete')}</h3></hr>`
}

const deliverFile = function(res,contentType,file){
  res.setHeader('Content-Type',contentType);  
  res.write(file||'');
  res.end();
}

lib = {};

lib.redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/','/login']) && req.user) res.redirect('/home.html');
}
lib.logoutUser = function(req,res) {
  res.setHeader('Set-Cookie',[`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  res.redirect('/login');
}
lib.getCreateTodoPage = function(fs,req,res) {
  let file = fs.readFileSync('./public/createToDo.html').toString();
  res.write(file.replace('username',`${req.user.userName}` || ""));
  res.end();
}
lib.createATodo = function(userRegistry,req,res) {
  let user = userRegistry.getAUser(req.user.userName);
  let newUser = user || new User(req.user.userName);
  let todo = newUser.addTodo(req.body.title,req.body.description);
  let items = req.body.item;
  if(items){
    if(typeof(items)=='string'){
        todo.addItem(items);
    } else {
      items.forEach((elem)=>todo.addItem(elem));
    }
  }
  if(!user) userRegistry.addNewUser(newUser);
  userRegistry.write();
  res.redirect('/viewTodo.html');
}
lib.getAllTodos = function(userRegistry,req,res) {
  let user = userRegistry.getAUser(req.user.userName);
  res.write(JSON.stringify(user)||"");
  res.end();
}


lib.getATodo = function(userRegistry,req,res) {
  let user = userRegistry.getAUser(req.user.userName);
  let todo = user.getSingleTodo(req.cookies.todoId);
  let todoContent = {};
  let text=`Title:  ${todo.getTitle()}`;
  todoContent.title = toHtmlParagraph('title',text,'','editTodoTitle','edit');
  text = `Description:  ${todo.getDescription()}`;
  todoContent.description = toHtmlParagraph('description',text,'','editTodoDescription','edit');
  todoContent.items = todo.mapItems(toHtmlItem).join('');
  res.send(JSON.stringify(todoContent),'application/json');
}
lib.deleteTodo = function(userRegistry,req,res) {
  let user = userRegistry.getAUser(req.user.userName);
  user.deleteTodo(req.cookies.todoId);
  userRegistry.write()
  res.redirect('/viewTodo.html');
}
lib.changeItemStatus = function(userRegistry,req,res){
  let user = userRegistry.getAUser(req.user.userName);  
  let todo = user.getSingleTodo(req.cookies.todoId);
  todo.changeItemStatus(req.body.itemId);
  userRegistry.write();
  res.end();
}

lib.deleteItem = function(userRegistry,req,res){
  let user = userRegistry.getAUser(req.user.userName);    
  let todo = user.getSingleTodo(req.cookies.todoId);
  todo.removeItem(req.body.itemId);
  userRegistry.write();
  res.send(JSON.stringify({"itemId":req.body.itemId}),'application/json')
}
lib.editItem = function(userRegistry,req,res) {
  let user = userRegistry.getAUser(req.user.userName);      
  let todo = user.getSingleTodo(req.cookies.todoId);
  todo.editItem(req.body.itemId,req.body.newObjective);
  let editedItem = todo.getItem(req.body.itemId);
  userRegistry.write();  
  let response = {};
  response.newItem = toHtmlItem(editedItem)
  response.itemId = req.body.itemId;
  res.send(JSON.stringify(response),'application/json');
}
lib.addNewItem = function(userRegistry,req,res){
  let user = userRegistry.getAUser(req.user.userName);      
  let todo = user.getSingleTodo(req.cookies.todoId);
  let itemId=todo.addItem(req.body.itemObjective);
  let item = toHtmlItem(todo.getItem(itemId));
  res.send(item,'text/html');
}
lib.editTodoTitle = function(userRegistry,req,res){
  let user = userRegistry.getAUser(req.user.userName);
  let todoTitle = user.editTodoTitle(req.cookies.todoId,req.body.newTitle);
  let text=`Title:  ${todoTitle}`;
  let titleHTMLformat = toHtmlParagraph('title',text,'','editTodoTitle','edit');
  res.send(titleHTMLformat,'text/html');
}
lib.editTodoDescription=function(userRegistry,req,res){
  let user = userRegistry.getAUser(req.user.userName);
  let todoDescription = user.editTodoDescription(req.cookies.todoId,req.body.newDescription);
  let text=`Description:  ${todoDescription}`;
  let descriptionHTMLformat = toHtmlParagraph('description',text,'','editTodoDescription','edit');
  res.send(descriptionHTMLformat,'text/html');
}



module.exports = lib;
