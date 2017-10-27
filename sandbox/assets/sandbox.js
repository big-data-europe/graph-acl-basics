// Pure lazy Vanilla JS.

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
var resultPanelBox = document.querySelector('.panel-box');
var resultPanel = document.getElementById('result-panel');
var result = document.getElementById('result');
var resultsPanel = document.querySelector('.results');
var results = document.getElementById('results');
var rwquery = false;
var annotationsBox = document.getElementById('annotations-box');
var annotations = document.getElementById('annotations');
var queriedAnnotations = document.getElementById('queried-annotations');
var authorizationInsert = document.getElementById('authorization-insert');
var sessionID = document.getElementById('session-id');
var domainButton = document.getElementById('toggle-domain');
var domain = document.getElementById('domain');

function encode(e) {
  return e.replace(/[\<\>\"\^]/g, function(e) {
	return "&#" + e.charCodeAt(0) + ";";
  });
}

readwrite.onchange = function(e){ 
    if(e.target.checked){
        writeConstraint.value = '';
        writeConstraint.disabled = true;
        writeConstraint.style.background = '#ddd';
        // writeConstraint.style.height = '40px';
        resize(writeConstraint)();
    }
    else { 
        writeConstraint.value = readConstraint.value;
        writeConstraint.disabled = false;
        writeConstraint.style.background = '#fff';
        // writeConstraint.style.height = '400px';
        resize(writeConstraint)();
    }
}

domainButton.onclick = function() {
    domain.style.display = domain.style.display == 'block' ? 'none' : 'block';
}

// rewrite query
button.onclick = function(){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(e) {
	if(request.readyState === 4) {
            result.className = '';
	    results.value = '';
            resultsPanel.style.display = "none";
            annotations.innerHTML = '';
            queriedAnnotations.innerHTML = '';
            annotationsBox.style.display = 'none';

	    if(request.status === 200) { 
		console.log('200');
		var jr = JSON.parse(e.target.responseText);
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
	    } else {
		// result.value = 'Error';
                rwquery = false;
                result.innerHTML = 'Error';
		result.className = 'error';
		runButton.disabled = true;
	    } 
	}
    }
    request.open("POST", "/as/sandbox", true);
    request.send("query=" + escape(query.value)
                 + "&readconstraint=" + escape(readConstraint.value)
                 + "&writeconstraint=" + escape((readwrite.checked ? readConstraint.value : writeConstraint.value))
                 + "&fprops=" + escape(fprops.value)
                 + "&session-id=" + escape(sessionID.value)
                + "&authorization-insert=" + escape(authorizationInsert.value));
};

// run rewritten query
runButton.onclick = function(){
    if( !rwquery )
	return 1;
    else {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function(e) {
	    if(request.readyState === 4) {
		if(request.status === 200) { 
		    console.log('200');
		    var jr = JSON.parse(e.target.responseText);
		    
		    results.className = 'filled';
		    results.value = JSON.stringify(jr.results.bindings, null, 2);
                    resultsPanel.style.display = "block";
                    location.hash = '#results-panel';
                    resize(results)();
		} else {
		    results.value = 'Error';
		    results.className = 'error';
		} 
	    }
	}
	request.open("POST", "/as/proxy", true);
	request.send(rwquery);
    }
};

applyButton.onclick = function(){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(e) {
	if(request.readyState === 4) {
            result.className = '';
	    results.value = '';
            resultsPanel.style.display = "none";
            annotations.innerHTML = '';
            queriedAnnotations.innerHTML = '';
            annotationsBox.style.display = 'none';

	    if(request.status === 200) { 
		console.log('200');
                jr = JSON.parse(e.target.responseText);
                applyMessage.style.display = "inline";
                applyMessage.innerHTML = 'Constraints applied.';
	    } else {
                applyMessage.innerHTML = 'Error applying constraints.';
	    } 
	}
    }
    request.open("POST", "/as/apply", true);
    request.send("&readconstraint=" + escape(readConstraint.value)
                 + "&writeconstraint=" + escape((readwrite.checked ? readConstraint.value : writeConstraint.value))
                 + "&fprops=" + fprops.value
                 + "&session-id=" + sessionID.value
                 + "&authorization-insert=" + authorizationInsert.value);
};

generateButton.onclick = function(){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(e) {
	if(request.readyState === 4) {
            result.className = '';
	    results.value = '';
            resultsPanel.style.display = "none";
            annotations.innerHTML = '';
            queriedAnnotations.innerHTML = '';
            annotationsBox.style.display = 'none';

	    if(request.status === 200) { 
		console.log('200');
                jr = JSON.parse(e.target.responseText);
                generateMessage.style.display = "inline";
                generateMessage.innerHTML = 'Model generated.';
                previewLink.style.display="inline";
	    } else {
                previewLink.style.display="none";
                generateMessage.innerHTML = 'Error generating model.';
	    } 
	}
    }
    request.open("POST", "/as/generate", true);
    request.send("&readconstraint=" + escape(readConstraint.value)
                 + "&writeconstraint=" + escape((readwrite.checked ? readConstraint.value : writeConstraint.value))
                 + "&fprops=" + fprops.value
                 + "&session-id=" + sessionID.value
                 + "&authorization-insert=" + authorizationInsert.value);
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
init();
