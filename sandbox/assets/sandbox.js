// Pure lazy Vanilla JS.

var plugins = document.getElementById('plugins');
var savePlugin = document.getElementById('save-plugin');
var savePluginAs = document.getElementById('save-plugin-as');
var clearPlugin = document.getElementById('clear-plugin');
var rewriteButton = document.getElementById('rewrite');
var runButton = document.getElementById('run');
var applyButton = document.getElementById('apply');
var message = document.getElementById('message');
var clearButton = document.getElementById('clear');
var generateButton = document.getElementById('generate');
var query = document.getElementById('query');
var readConstraint = document.getElementById('read-constraint');
var writeConstraint = document.getElementById('write-constraint');
var readwrite = document.getElementById('read-write');
var fprops = document.getElementById('fprops');
var queryFprops = document.getElementById('query-fprops');
var uvs = document.getElementById('uvs');
var resultPanelBox = document.querySelector('.panel-box');
var resultPanel = document.getElementById('result-panel');
var result = document.getElementById('result');
var resultsPanel = document.querySelector('.results');
var results = document.getElementById('results');
var rwquery = false;
var annotationsBox = document.getElementById('annotations-box');
var annotations = document.getElementById('annotations');
var queriedAnnotations = document.getElementById('queried-annotations');
var authorizationUser = document.getElementById('authorization-user');
var domainButton = document.getElementById('toggle-domain');
var domain = document.getElementById('domain');

function encode(e) {
  return e.replace(/[\<\>\"\^]/g, function(e) {
	return "&#" + e.charCodeAt(0) + ";";
  });
}

var Req = function(method, path, succeed, fail){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(e) {
	if(request.readyState === 4) {
	    if(request.status === 200) { 
                succeed(JSON.parse(e.target.responseText));
	    } else {
                fail(e);
	    } 
	}
    }
    request.open(method, path, true);
    return request;
}

var withAuth = function(user, cb){
    var request = Req("POST", "/as/auth", cb, function(){ alert('Error inserting authorization triples') });
    request.send("user=" + escape(user));
}


readwrite.onchange = function(e){ 
    if(e.target.checked){
        writeConstraint.value = '';
        writeConstraint.disabled = true;
        writeConstraint.style.background = '#ddd';
        resize(writeConstraint)();
    }
    else { 
        writeConstraint.value = readConstraint.value;
        writeConstraint.disabled = false;
        writeConstraint.style.background = '#fff';
        resize(writeConstraint)();
    }
}

domainButton.onclick = function() {
    domain.style.display = domain.style.display == 'block' ? 'none' : 'block';
}

// rewrite query
rewriteButton.onclick = function(){
    withAuth(authorizationUser.value,
             function(){
                 var request = Req("POST","/as/sandbox",
                          function(jr){
                              result.className = '';
	                      results.value = '';
                              resultsPanel.style.display = "none";
                              annotations.innerHTML = '';
                              queriedAnnotations.innerHTML = '';
                              annotationsBox.style.display = 'none';

		              resultPanelBox.className = 'panel-box filled';
                              rwquery =  jr.rewrittenQuery.trim();

                              var a, an;
                              if( jr.annotations.length > 0 || jr.queriedAnnotations.length > 0 ){
                                  for( var i = 0; i < jr.annotations.length; i++){
                                      console.log(jr.annotations[i]);
                                      a = jr.annotations[i];
                                      an = document.createElement("li");
                                      t = a["key"];
                                      if( "var" in a ){
                                          t += ": " + a["var"];
                                      }
                                      an.appendChild(document.createTextNode(t));
                                      annotations.appendChild(an);
                                  }
                                  for( var i = 0; i < jr.queriedAnnotations.length; i++){
                                      a = jr.queriedAnnotations[i];
                                      an = document.createElement("li");
                                      t = a["key"];
                                      if( "var" in a ){
                                          t += ": " + a["var"];
                                      }
                                      an.appendChild(document.createTextNode(t));
                                      queriedAnnotations.appendChild(an);
                                  }
                                  annotationsBox.style.display = 'block';
                                  // location.hash = '#result-panel';

                              }

                              result.innerHTML = encode(rwquery);
		              runButton.disabled = false;

                          },
                          function(){
                              result.className = '';
	                      results.value = '';
                              resultsPanel.style.display = "none";
                              annotations.innerHTML = '';
                              queriedAnnotations.innerHTML = '';
                              annotationsBox.style.display = 'none';

                              rwquery = false;
                              result.innerHTML = 'Error';
		              result.className = 'error';
		              runButton.disabled = true;
                          });
        request.send("query=" + escape(query.value)
                     + "&readconstraint=" + escape(readConstraint.value)
                     + "&writeconstraint=" + escape((readwrite.checked ? readConstraint.value : writeConstraint.value))
                     + "&fprops=" + escape(fprops.value)
                     + "&query-fprops=" + escape(queryFprops.checked)
                     + "&uvs=" + escape(uvs.value)
                     //+ "&session-id=" + escape(sessionID.value)
                    );
    });
};

// run rewritten query
runButton.onclick = function(){
    if( !rwquery )
	return -1;
    else {
        withAuth(authorizationUser.value,
                 function(){        
	             results.value = '';

                     var request = Req("POST", "/as/proxy",
                                       function(jr){
		                           results.className = 'filled';
		                           results.innerHTML = JSON.stringify(jr.results.bindings, null, 2);
                                           resultsPanel.style.display = "block";
                                           // location.hash = '#results-panel';
                                           showColumn('#results-column');
                                           // resize(results)();
                                       },
                                       function(){
                                           results.value = 'Error';
		                           results.className = 'error';
                                       });
	             request.send(rwquery);
                 });
    }
};

applyButton.onclick = function(){
    var request = Req("POST", "/as/apply",
                      function(jr){
                          message.style.display = "inline";
                          message.innerHTML = 'Constraints applied.';
                      },
                      function(){
                          message.innerHTML = 'Error applying constraints.';
                      });

    request.send("&readconstraint=" + escape(readConstraint.value)
                 + "&writeconstraint=" + escape((readwrite.checked ? readConstraint.value : writeConstraint.value))
                 + "&fprops=" + escape(fprops.value)
                 + "&query-fprops=" + escape(queryFprops.checked)
                 + "&uvs=" + escape(uvs.value)
                 //+ "&session-id=" + sessionID.value
                );
};

// clear data
clearButton.onclick = function(){
    var request = Req("DELETE", "/as/clear",
                      function(jr){
                          message.style.display = "inline";
                          message.innerHTML = 'Data cleared.';
                      },
                      function(){
                          message.innerHTML = 'Error clearing data.';
                      });

    request.send();
};

// generate data
generateButton.onclick = function(){
    withAuth("http://mu.semte.ch/users/principle",
             function(){
                 var request = Req("POST", "/generator/generate",
                                   function(jr){
                                       message.style.display = "inline";
                                       message.innerHTML = 'Generating model.';
                                   },
                                   function(){
                                       message.innerHTML = 'Error generating model.';
                                   });
                 request.send("&readconstraint=" + escape(readConstraint.value)
                              + "&writeconstraint=" + escape((readwrite.checked ? readConstraint.value : writeConstraint.value))
                              + "&fprops=" + fprops.value
                              + "&query-fprops=" + escape(queryFprops.checked)
                              + "&uvs=" + escape(uvs.value)
                             );
             });
};

var observe;
if (window.attachEvent) {
    observe = function (element, event, handler) {
        element.attachEvent('on'+event, handler);
    };
}
else {
    observe = function (element, event, handler) {
        element.addEventListener(event, handler, false);
    };
}

function resize (text) {
    return function() {
        text.style.height = 'auto';
        text.style.height = text.scrollHeight+'px';
    }
}
/* 0-timeout to get the already changed text */
function delayedResize (resize) {
    return function() {
        window.setTimeout(resize, 0);
    }
}

function init () {
    var textareas = document.querySelectorAll('textarea');
    
    [].forEach.call(textareas, function(text){
        var resizer = resize(text);
        var dresizer = delayedResize(resizer);
        observe(text, 'change',  resizer);
        observe(text, 'cut',     dresizer);
        observe(text, 'paste',   dresizer);
        observe(text, 'drop',    dresizer);
        observe(text, 'keydown', dresizer);

        text.focus();
        text.select();
        resizer();
    });

[].forEach.call(document.querySelectorAll(".close"), function(button){
    button.onclick = stretchColumns;
});

[].forEach.call(document.querySelectorAll(".help"), function(button){
    button.onclick = function(){ showColumn("#help") }
});
}

// load plugins <select>
var option;
var pluginsReq = Req("GET", "/as/plugin",
                            function(jr){
                                [].forEach.call(jr.plugins, function(plugin){
                                    option = document.createElement("option");
                                    option.appendChild(document.createTextNode(plugin));
                                    plugins.appendChild(option);
                                });
                            },
                            function(){
                                alert('Error loading plugins');
                            });
pluginsReq.send();

// load plugin
plugins.onchange = function(e){ 
    if(e.target.value == ''){
        clear();
    }
    else{
        var pluginReq = Req("GET", "/as/plugin/" + e.target.value,
                            function(jr){
                                var r = jr.readConstraint.trim();
                                var w = jr.writeConstraint.trim();

                                readConstraint.value = r;
                                resize(readConstraint)();

                                if(r == w){
                                    readwrite.checked = true;
                                    writeConstraint.value = '';
                                    writeConstraint.disabled = true;
                                    writeConstraint.style.background = '#ddd';
                                }
                                else {
                                    readwrite.checked = false;
                                    writeConstraint.value = w;
                                    writeConstraint.disabled = false;
                                    writeConstraint.style.background = '#fff';
                                }

                                resize(writeConstraint)();

                                fprops.value = '';
                                [].forEach.call(jr.functionalProperties, function(fp){
                                    if(fprops.value != '') fprops.value += ', ';
                                    fprops.value += fp
                                });

                                uvs.value = '';
                                [].forEach.call(jr.uniqueVariables, function(uv){
                                    if(uvs.value != '') uvs.value += ', ';
                                    uvs.value += uv
                                });
                                queryFprops.checked = jr.queryFunctionalProperties;
                                savePluginAs.disabled = false;
                            },
                            function(e){
                                alert('Error');
                            });
        pluginReq.send();
    }
};

var clear = function(){
    plugins.value = '';
    message.innerHTML = '';
    savePluginAs.disabled = true;
    readConstraint.value = 
        "CONSTRUCT {\n"
        + "  ?a ?b ?c\n"
        + "}\n"
        + "WHERE {\n"
        + " GRAPH <http://mu.semte.ch/application> {\n"
        + "   ?a ?b ?c\n"
        + " }\n"
        + "}";
    resize(readConstraint)();
    readwrite.checked = true;  
    queryFprops.checked = false;
    writeConstraint.value = '';    
    writeConstraint.disabled = true;
    writeConstraint.style.background = '#ddd';
    resize(writeConstraint)();
    fprops.value = '';
    uvs.value = '';
    savePluginAs.disabled = true;
}

clearPlugin.onclick = clear;

// save plugin
var save = function(){
    var name, newName;
    if(plugins.value == ''){
        newName = true;
        name = escape(prompt("Plugin name").replace(' ','-'));
    }
    else {
        name = plugins.value;
    }

    var saveReq = Req("POST", "/as/plugin/" + name,
                             function(jr){
                                 if(newName){
                                     var option = document.createElement("option");
                                     option.appendChild(document.createTextNode(name));
                                     plugins.appendChild(option);
                                     plugins.value = name;
                                     savePluginAs.disabled = false;
                                 }
                                 message.innerHTML = "Constraint saved.";
                             },
                             function(e){
                                     message.innerHTML = "Error saving constraint.";
                             });
        saveReq.send("readconstraint=" + escape(readConstraint.value)
                     + (readwrite.checked ? "&readwrite=t" : ("&writeconstraint=" + writeConstraint.value))
                     + "&fprops=" + escape(fprops.value)
                     + "&query-fprops=" + escape(queryFprops.checked)
                     + "&uvs=" + escape(uvs.value));
};

savePlugin.onclick = save;
savePluginAs.onclick = function(){
    plugins.value = '';
    save();
}

var showColumn = function(id){
    stretchColumns();
    scrunchColumns();
    var column = document.querySelector(id);
    column.style.display = "block";
    column.style.width = "40%";
}
var scrunchColumns = function(){
    [].forEach.call(document.querySelectorAll('.column'), function(column){
        column.style.width = "20%";
    });
}

var stretchColumns = function(){
    [].forEach.call(document.querySelectorAll('.column'), function(column){
        column.style.width = "33%";
    });
    [].forEach.call(document.querySelectorAll('.column.side'), function(column){
        column.style.display = "none";
    });
}

init();
clear();
