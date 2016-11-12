module.exports = [
  {
  "type": "section",
  "items": [
    {
      "type": "heading",
      "defaultValue": "Any.do login"
    },
    {
      "type": "input",
      "appKey": "email",      
      "label": "Email Address",
      "attributes": {
        "placeholder": "eg: name@domain.com",
        "required": "required",
        "type": "email"
      }
    },
    {
      "type": "input",
      "appKey": "password",
      "label": "Password",
      "attributes": {
        "placeholder": "Password",
        "required": "required",
        "type": "password"
      }
    },
    {
      "type": "text",
      "appKey": "auth_text",
      "defaultValue": "unset",
    },
    {
    "type": "button",
    "appKey": "auth_button",
    "primary": true,
    "defaultValue": "Get authentication key"
    }    
  ]
    
},
{
  "type": "section",
  "items":[
    {
      "type": "heading",
      "defaultValue": "App settings"
    },
    {
    "type": "toggle",
    "appKey": "hide_done_toggle",
    "label": "Hide done tasks",
    "defaultValue": false,
    }
  ]
},
{
  "type": "submit",
  "defaultValue": "Save"
}
];