(*functional-properties* '(rdf:type))

(*unique-variables* '())

(define-constraint  
  'read/write 
  (lambda ()    "
PREFIX graphs: <http://mu.semte.ch/school/graphs/>
PREFIX school: <http://mu.semte.ch/vocabularies/school/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX dct: <http://purl.org/dc/terms/>

CONSTRUCT {
 ?a ?b ?c.
}
WHERE {
 @access Type(?type)
 GRAPH ?graph {
  ?a ?b ?c.
  ?a rdf:type ?type.
 }
 VALUES (?graph ?type ?b) { 
  (graphs:grades school:Grade rdf:type) 
  (graphs:grades school:Grade school:gradePoints) 
  (graphs:grades school:Grade school:gradeRecipient) 
  (graphs:grades school:Grade mu:uuid) 
  (graphs:subjects school:Subject rdf:type) 
  (graphs:subjects school:Subject dct:title) 
  (graphs:subjects school:Subject mu:uuid) 
  (graphs:classes school:Class rdf:type) 
  (graphs:classes school:Class dct:title) 
  (graphs:classes school:Class dct:Subject) 
  (graphs:classes school:Class school:teacher) 
  (graphs:classes school:Class school:student) 
  (graphs:classes school:Class school:classGrade) 
  (graphs:classes school:Class dct:subject) 
  (graphs:classes school:Class mu:uuid) 
  (graphs:people foaf:Person rdf:type) 
  (graphs:people foaf:Person foaf:name) 
  (graphs:people foaf:Person foaf:mbox) 
  (graphs:people foaf:Person school:role) 
  (graphs:people foaf:Person mu:uuid) 
 }
}  "))

