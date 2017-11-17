(*functional-properties* '(rdf:type))

(*unique-variables* '())

(*query-functional-properties?* #t)

(define-constraint  
  'read/write 
  (lambda ()    "
PREFIX graphs: <http://mu.semte.ch/school/graphs/>
PREFIX school: <http://mu.semte.ch/vocabularies/school/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

CONSTRUCT {
 ?a ?b ?c.
}
WHERE {
 @access Type(?type)
 GRAPH ?graph {
  ?a ?b ?c.
  ?a a ?type.
 }
 VALUES (?graph ?type) { 
  (graphs:grades school:Grade) 
  (graphs:subjects school:Subject) 
  (graphs:classes school:Class) 
  (graphs:people foaf:Person) 
 }
}  "))

