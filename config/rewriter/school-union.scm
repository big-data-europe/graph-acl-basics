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
 {
  GRAPH graphs:grades {
   ?a ?b ?c.
   ?a rdf:type school:Grade.
  }
 } UNION  {
  GRAPH graphs:classes {
   ?a ?b ?c.
   ?a rdf:type school:Class.
  }
 } UNION  {
  GRAPH graphs:subjects {
   ?a ?b ?c.
   ?a rdf:type school:Subject.
  }
 } UNION  {
  GRAPH graphs:people {
   ?a ?b ?c.
   ?a rdf:type foaf:Person.
  }
 } 
}  "))

