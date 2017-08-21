# graph-acl-basics

This is a basis for learning to work with access rights stored in the graphs based on the work of @nathanielrb in https://github.com/nathanielrb/mu-graph-rewriter

## How to

- clone this project
- update ./config/rewriter
- update ./config/resources

Play with the access rights you have defined


### Boot up the system

Boot your microservices-enabled system using docker-compose.

    cd /path/to/graph-acl-basics
    docker-compose up

You can shut down using `docker-compose stop` and remove everything using `docker-compose rm`.
