(*functional-properties* '(rdf:type))

(define-namespace graphs "http://mu.semte.ch/school/graphs/")

(define-namespace school "http://mu.semte.ch/vocabularies/school/")

(define-constraint
  'read
  (lambda ()
    (let ((session (header 'mu-session-id)))
      (conc "CONSTRUCT {"
            "  ?s ?p ?o."
            "}"
            "WHERE {"
            "  GRAPH ?graph {"
            "    ?s ?p ?o."
            "    ?s rdf:type ?type "
            "  }"
            "  VALUES (?graph ?type) { "
            "    (graphs:subjects school:Subject) "
            "    (graphs:classes school:Class) "
            "    (graphs:people <http://xmlns.com/foaf/0.1/Person>) "
            "    (graphs:grades school:Grade) "
            "  }"
            "}"))))

(define-constraint
  'write
  (lambda ()
    (let ((session (header 'mu-session-id)))
      (conc "CONSTRUCT {"
            "  ?s ?p ?o."
            "}"
            "WHERE {"
            "  GRAPH ?graph {"
            "    ?s ?p ?o."
            "    ?s rdf:type ?type "
            "  }"
            "  VALUES (?graph ?type) { "
            "    (graphs:subjects school:Subject) "
            "    (graphs:classes school:Class) "
            "    (graphs:people <http://xmlns.com/foaf/0.1/Person>) "
            "    (graphs:grades school:Grade) "
            "  }"
            "}"))))
