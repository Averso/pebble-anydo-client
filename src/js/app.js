//clay
var Settings = require('settings');

var Clay = require('clay');
var clayConfig = require('config');
var customClay = require('custom-clay');

//TODO: fix code below
var userData = {token: 'abc123'};
var clay = new Clay(clayConfig, customClay);

var UI = require('ui');
var Vibe = require('ui/vibe');
var Vector2 = require('vector2');

var categories = null;
var tasks = null;
var authkey = null;
var main_window = null;
var categoriesIds = [];
var hide_done_tasks=null;

class Task {
  constructor(id,title,section_index, item_index, sub_tasks,checked) {
    this.id = id;
    this.title = title;
    this.section_index = section_index; //number
    this.item_index = item_index;        //number
    this.sub_tasks = sub_tasks;            //booleanm
    this.checked = checked;
  }
}

var in_menu_tasks = [];

//TODO: when no email, login - add condition,  manage sub tasks, add checked/unchecked icons, settings - show/hide done tasks
//functons 

function manage_select(e)
{
    var selected_task;
    //get selected task
  
    console.log(e.sectionIndex + "  " + e.itemIndex);
    for (var i in in_menu_tasks) {
      
      if(in_menu_tasks[i].section_index === e.sectionIndex && in_menu_tasks[i].item_index === e.itemIndex)
      {
       
        selected_task= in_menu_tasks[i];
        break;
      }
    }
    //if have no subtasks, just change status
    if(selected_task.sub_tasks)
    {
      //show window with subtasks

    }
    else //TODO: send to serwer
    {
      if(selected_task.checked){
        
         selected_task.checked = false;
         main_window.item(e.sectionIndex,e.itemIndex,{ title: "[ ] " + selected_task.title});
        
        
      }
      else{
        
        selected_task.checked = true;
        main_window.item(e.sectionIndex,e.itemIndex,{ title: "[x] " + selected_task.title}); 
      }
      
      //update task on server
      send_changed_task(selected_task);
       
        
    }
}

function set_main_window(cats,tsks)
{ 
  //clear up array
  in_menu_tasks=[];
  //we set up window after getting categories and tasks
  var checked = false;
  categories = cats;
  tasks=tsks;
  categoriesIds = [];
  var sectionsItemsIndex = [];
  var sectionsItems = []; //array for items for each section
  
  //set up categories as sections
  var k = 0;
  for (var i in categories)
  {
    //prevent loading deleted categories
    if(!(categories[i].isDeleted))
    {
        //add category id
        categoriesIds.push(categories[i].id);
        sectionsItemsIndex.push(0);
        var section = {title: categories[i].name};
        main_window.section(k,section);
        sectionsItems.push([]);
        k++;
    }
   
  }
  
  //load tasks to sections
  for (var j in tasks) {
   // console.log(tasks[j].title + " " + tasks[j].status);
    //get id of category
    var categId = tasks[j].categoryId;
    
    //get index of section
    var index = categoriesIds.indexOf(categId);    
    
    var taskTitle = "[ ] ";
    
    //check if task is done and add mark for it
    if (tasks[j].status === 'DONE' || tasks[j].status === 'CHECKED') {
          taskTitle = "[x] ";
          checked=true;
    }    
    taskTitle+=tasks[j].title;
    
        
    //check if have subTask and add proper subtitle if yes
    if(tasks[j].subTasks.length === 0){    
      //add task to in app task array
      in_menu_tasks.push(new Task(tasks[j].id,tasks[j].title,index,sectionsItemsIndex[index],false,checked));
      //add item to menu window
      //icon icon: "images/icon_task_unchecked.png"
      //main_window.item(index,sectionsItemsIndex[index], );
      sectionsItems[index].push({ title: taskTitle});
    }      
    else{ 
       in_menu_tasks.push(new Task(tasks[j].id,tasks[j].title,index,sectionsItemsIndex[index],true,checked));
       //main_window.item(index,sectionsItemsIndex[index], { title: taskTitle, subtitle: 'Ma podzadania' });
      sectionsItems[index].push({ title: taskTitle, subtitle: 'Ma podzadania' });
    }
    
    //increment index fo section
    sectionsItemsIndex[index]+=1;
    
  }
  //put items to sections
    for( var l in sectionsItems)
    { 
      console.log(l + ": " + sectionsItems[l]);
      main_window.items(l,sectionsItems[l]);
    }
  
  
  //move oursor to the top of main window
  main_window.selection(0, 0);

  
 
}


//manage clay configuration

Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e && !e.response) {
    return;
  }
  var dict = clay.getSettings(e.response);

  // Save the Clay settings to the Settings module. 
  Settings.option(dict);  
  
});



//------------Run app----------------
//create main window
main_window = new UI.Menu({
    backgroundColor: 'white',
    textColor: 'black',
    highlightBackgroundColor: 'blue',
    highlightTextColor: 'white',
    
  });


//buttons listeners  
//select action
main_window.on('select', function(e)
               { manage_select(e); });

//long select action
main_window.on('longSelect', function(e)
               {
                 //synchronize
                 Vibe.vibrate('short');
                 anydo_download_data();
               });

//get hide don tasks setting
hide_done_tasks = Settings.option('hide_done_toggle');

//download data
anydo_download_data();

//show main window
main_window.show();




///-----------------------------------


function show_no_internet_window()
{
    var error_window = new UI.Card({
    title: 'No internet!',  
    body: 'Check your internet connection'
    });
    error_window.show();
}

function show_no_auth_window()
{
    var error_window = new UI.Card({
    title: 'No authentication!',  
    body: 'Check and set your authentication key in app settings!'
    });
    error_window.show();
}

//--------------ANY DO FUNCTIONS--------------//

function anydo_download_data()
{
    //get auth key
    authkey = Settings.option('auth_text');
    // if user hasn't set auth key'
    if (authkey === "Problem with internet connection!" || authkey === "Wrong login data!")
    {
      show_no_auth_window();
    }
    else
    {
      //we get catategories first, then will get tasks
      var base_url = "https://sm-prod2.any.do/";
      var xhr = new XMLHttpRequest();
        
      xhr.onload = function () {      
        var categories  = JSON.parse(this.responseText);
        anydo_get_tasks(authkey,categories);
      };
      
      //on error occurs, show error window
      xhr.onerror = function()
      {
        show_no_internet_window();
      };
      
      xhr.open('GET', base_url + '/me/categories');
      xhr.setRequestHeader('X-Anydo-Auth', authkey);
      xhr.send();
    }
 
}


function anydo_get_tasks(auth,categories) {
    var xhr = new XMLHttpRequest();
  
    xhr.onload = function () {
      var tasks = JSON.parse(this.responseText);
      set_main_window(categories,tasks);
    };
  
    //get tasks based on app setting "hide/show done tasks"
    if(hide_done_tasks)
    {
      xhr.open('GET', 'https://sm-prod2.any.do/me/tasks?includeDeleted=false&includeDone=false');
    }
    else
    {
      xhr.open('GET', 'https://sm-prod2.any.do/me/tasks?includeDeleted=false');        
    }
    
    xhr.setRequestHeader('X-Anydo-Auth', auth);
    xhr.send();
}

function send_changed_task(task) {
  
    var xhr = new XMLHttpRequest();
    var chosen_task;
    //change task based on object checked attribute
    for(var i in tasks)
    {
      //console.log(task.id);
      //console.log(tasks[i].id);
      if(task.id === tasks[i].id)
      {
        //task obj is already changed in matter of checked/unchecked
        if(task.checked)
        {
            tasks[i].status = "CHECKED";
        }
        else
        {
            tasks[i].status = "UNCHECKED";
        }
        
        chosen_task = tasks[i];
        console.log('task after:' + JSON.stringify(chosen_task));
       // console.log('found task:' + JSON.stringify(chosen_task));
        break;
      }
    }
   
   
    //stringify task
    var json_task = JSON.stringify(chosen_task);
    console.log('stringifyied');
    console.log(chosen_task.globalTaskId);
    var url = "https://sm-prod2.any.do/me/tasks/" + chosen_task.globalTaskId;
    console.log(url);
    xhr.open('PUT', url);
    xhr.setRequestHeader('X-Anydo-Auth', authkey);
    xhr.setRequestHeader('Content-Type', 'application/json');
  
    console.log(json_task);
    xhr.send(json_task);
    console.log('send');
    xhr.onload = function () {         
        console.log(this.status);
        console.log('DONE!');
                 
    };
    
    //show error message
    xhr.onerror = function () {    
        console.log('Error!');     
        
    };
 
}
