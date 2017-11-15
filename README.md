# graph-acl-sandbox

This is a basis for learning to work with access rights stored in the graphs based on the work of @nathanielrb in https://github.com/nathanielrb/mu-graph-rewriter

## How to

### Setup

Clone this project, and build the sample application (requires Node.js, Bower, and ember-cli):

    cd ./rewriter-sandbox-application
    ember build

### Boot up the system

Boot your microservices-enabled system using docker-compose.

    cd /path/to/graph-acl-basics
    docker-compose up

You can shut down using `docker-compose stop` and remove everything using `docker-compose rm`.

### The Sandbox and Sample App

The sandbox is available at http://localhost:9000 and allows interactive testing of rewriting logic.

A basic school model, as described in `config/resource/domain.lisp` is set up to allow testing of the model. In the sandbox, you can load a tested constraint plugin and generate random data according to this model.

The sample application is available at http://localhost:9001

### Annotations

Annotations, prefixed by `@access`, are parsed as quads-level statements. There are two types of annotations:

    @access Label
    @access Label(?var)

Annotations are calculated both at rewrite-time and in the database.

```
CONSTRUCT {
  ?a ?b ?c
}
WHERE {
  @access All
  GRAPH ?graph { 
    @access Graph(?graph)
    ?a ?b ?c .
    ?a a ?type
  }
  VALUES (?graph ?type) {
    (g:classes school:Class) 
    (g:people foaf:Person) 
  }
}
```

### Logging

The Docker logs the rewriter are extremely verbose, to allow for debugging.

    sudo docker-compose logs -f as