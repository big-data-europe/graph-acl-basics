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
 GRAPH <http://mu.semte.ch/authorization> {
  <SESSION> mu:account ?user.
 }
 {
  GRAPH ?graph {
   ?a ?b ?c.
   ?a rdf:type foaf:Person.
  }
  VALUES ?b { rdf:type foaf:name foaf:mbox school:role mu:uuid }
  VALUES ?graph { graphs:people }
 }
 UNION {
  GRAPH ?graph {
   ?a ?b ?c.
   ?a rdf:type school:Class.
  }
  VALUES ?b { rdf:type dct:title dct:subject school:teacher school:student school:classGrade mu:uuid }
  VALUES ?graph { graphs:classes }
 }
 UNION {
  GRAPH ?graph {
   ?a ?b ?c.
   ?a rdf:type school:Subject.
  }
  VALUES ?b { rdf:type dct:title mu:uuid }
  VALUES ?graph { graphs:subjects }
 }
 UNION {
  GRAPH ?graph {
   ?a ?b ?c.
   ?a rdf:type school:Grade.
  }
  VALUES ?b { rdf:type school:gradePoints school:gradeRecipient mu:uuid }
  VALUES ?graph { graphs:grades }
  {
   GRAPH graphs:people {
    ?user school:role \"principle\".
   }
  }
  UNION {
   GRAPH graphs:people {
    ?user school:role \"teacher\".
   }
   GRAPH graphs:classes {
    ?class school:hasTeacher ?user.
    ?class school:classGrade ?a.
   }
  }
  UNION {
   GRAPH graphs:people {
    ?user school:role \"student\".
   }
   GRAPH graphs:grades {
    ?a school:gradeRecipient ?user.
   }
  }
 }
}  "))

