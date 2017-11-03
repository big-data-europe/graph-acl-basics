// Pure lazy Vanilla JS.

var plugins = document.getElementById('plugins');
var savePlugin = document.getElementById('save-plugin');
var savePluginAs = document.getElementById('save-plugin-as');
var clearPlugin = document.getElementById('clear-plugin');
var button = document.getElementById('rewrite');
var runButton = document.getElementById('run');
var applyButton = document.getElementById('apply');
var applyMessage = document.getElementById('apply-message');
var generateButton = document.getElementById('generate');
var generateMessage = document.getElementById('generate-message');
var previewLink =  document.getElementById('preview');
var query = document.getElementById('query');
var readConstraint = document.getElementById('read-constraint');
var writeConstraint = document.getElementById('write-constraint');
var readwrite = document.getElementById('read-write');
var fprops = document.getElementById('fprops');
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
// var authorizationInsert = document.getElementById('authorization-insert');
var authorizationUser = document.getElementById('authorization-user');
// var sessionID = document.getElementById('session-id');
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
button.onclick = function(){
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
                                  location.hash = '#result-panel';

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
		                           results.value = JSON.stringify(jr.results.bindings, null, 2);
                                           resultsPanel.style.display = "block";
                                           location.hash = '#results-panel';
                                           resize(results)();
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
                          applyMessage.style.display = "inline";
                          applyMessage.innerHTML = 'Constraints applied.';
                      },
                      function(){
                          applyMessage.innerHTML = 'Error applying constraints.';
                      });

    request.send("&readconstraint=" + escape(readConstraint.value)
                 + "&writeconstraint=" + escape((readwrite.checked ? readConstraint.value : writeConstraint.value))
                 + "&fprops=" + escape(fprops.value)
                 + "&uvs=" + escape(uvs.value)
                 //+ "&session-id=" + sessionID.value
                );
};

generateButton.onclick = function(){
    var request = Req("DELETE", "/as/clear",
                      function(jr){
                          withAuth("http://mu.semte.ch/users/principle",
                                   function(){
                                       var request = Req("POST", "/generator/generate",
                                                         function(jr){
                                                             generateMessage.style.display = "inline";
                                                             generateMessage.innerHTML = 'Model generated.';
                                                             previewLink.style.display="inline";
                                                         },
                                                         function(){
                                                             previewLink.style.display="none";
                                                             generateMessage.innerHTML = 'Error generating model.';
                                                         });
                                       request.send("&readconstraint=" + escape(readConstraint.value)
                                                    + "&writeconstraint=" + escape((readwrite.checked ? readConstraint.value : writeConstraint.value))
                                                    + "&fprops=" + fprops.value
                                                    + "&uvs=" + escape(uvs.value)
                                                   );
                                   })
                      },
                      function(){
                          previewLink.style.display="none";
                          generateMessage.innerHTML = 'Error generating model.';
                      });

    request.send();
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

}

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

plugins.onchange = function(e){ 
    var pluginReq = Req("GET", "/as/plugin/" + e.target.value,
                               function(jr){
                                   var r = jr.readConstraint.trim();
                                   var w = jr.writeConstraint.trim();

                                   readConstraint.value = r;
                                   resize(readConstraint)();

                                   if(r == w){
                                       readwrite.checked = true;
                                       writeConstraint.value = '';
                                   }
                                   else {
                                       readwrite.checked = false;
                                       writeConstraint.value = w;
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
                                   savePluginAs.disabled = false;
                               },
                               function(e){
                                   alert('Error');
                               });
    pluginReq.send();
};

var clear = function(){
    plugins.value = '';
    readConstraint.value = 
        "PREFIX graphs: <http://mu.semte.ch/school/graphs/>\n"
        + "PREFIX school: <http://mu.semte.ch/vocabularies/school/>\n"
        + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
        + "\n"
        + "CONSTRUCT {\n"
        + "  ?a ?b ?c\n"
        + "}\n"
        + "WHERE {\n"
        + " @access Type(?type)\n"
        + " GRAPH ?graph {\n"
        + "   ?a ?b ?c;\n"
        + "      a ?type\n"
        + " }\n"
        + " VALUES (?graph ?type) {\n"
        + "    (graphs:grades school:Grade)\n"
        + "    (graphs:subjects school:Subject) \n"
        + "    (graphs:classes school:Class) \n"
        + "    (graphs:people foaf:Person) \n"
        + "  }\n"
        + "}";
    resize(readConstraint)();
    readwrite.checked = true;  
    writeConstraint.value = '';    
    writeConstraint.disabled = true;
    writeConstraint.style.background = '#ddd';
    resize(writeConstraint)();
    fprops.value = 'rdf:type';
    uvs.value = '';
    savePluginAs.disabled = true;
}

clearPlugin.onclick = clear;

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
                             },
                             function(e){
                                 alert('Error');
                             });
        saveReq.send("readconstraint=" + escape(readConstraint.value)
                     + (readwrite.checked ? "&readwrite=t" : ("&writeconstraint=" + writeConstraint.value))
                     + "&fprops=" + escape(fprops.value)
                     + "&uvs=" + escape(uvs.value));
};

savePlugin.onclick = save;
savePluginAs.onclick = function(){
    plugins.value = '';
    save();
}

init();
clear();