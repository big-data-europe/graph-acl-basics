(*functional-properties* '(rdf:type))

(define-namespace graphs "http://mu.semte.ch/school/graphs/")

(define-namespace school "http://mu.semte.ch/vocabularies/school/")

(define-constraint
  'read/write
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
            "    (graphs:people school:Person) "
            "    (graphs:grades school:Grade) "
            "  }"
            "}"))))
