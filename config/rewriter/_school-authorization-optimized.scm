(*functional-properties* '(rdf:type))

(*unique-variables* '(?user ?role))

(*query-functional-properties?* #t)

(*queried-properties* '())

(*headers-replacements* '(("<SESSION>" mu-session-id uri)))

(define-constraint  
  'read/write
  (lambda ()
    (let* ((role (alist-ref 'role
                   (sparql-select-unique (conc "SELECT ?role WHERE { "
                                               " <~A> mu:account ?user."
                                               " ?user <http://mu.semte.ch/vocabularies/school/role> ?role "
                                               " }")
                                         (or (header 'mu-session-id)
                                             "http://mu.semte.ch/sessions/3ae1614a-e1bd-11e7-9bcc-000000000000")))))
      (log-message "~%ROLE: ~A~%" role)
      (format   "
PREFIX graphs: <http://mu.semte.ch/school/graphs/>
PREFIX school: <http://mu.semte.ch/vocabularies/school/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX dct: <http://purl.org/dc/terms/>

CONSTRUCT {
 ?a ?b ?c.
}
WHERE {
 GRAPH <http://mu.semte.ch/authorization> {
  <SESSION> mu:account ?user.
 }
 {
  @access Type(?type)
  FILTER (?type != school:Grade)
  GRAPH ?graph {
   ?a ?b ?c.
   ?a rdf:type ?type.
  }
 }
 UNION {
  @access Grade
  FILTER (?type = school:Grade)
  GRAPH ?graph {
   ?a ?b ?c.
   ?a rdf:type ?type.
  }
 ~A
 }
 VALUES (?graph ?type) { 
  (graphs:grades school:Grade) 
  (graphs:subjects school:Subject) 
  (graphs:classes school:Class) 
  (graphs:people foaf:Person) 
 }
}" (match role
     ("principle" "")
     ("teacher"  (conc " GRAPH graphs:classes { "
                       "   ?class school:hasTeacher ?user. "
                       "   ?class school:classGrade ?a. "
                       " } "))
    ("student" (conc " GRAPH graphs:grades { "
                     "   ?a school:gradeRecipient ?user. "
                     " } ")))))))
