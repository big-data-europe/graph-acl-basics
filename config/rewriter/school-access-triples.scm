(*functional-properties* '(rdf:type))

(define-namespace graphs "http://mu.semte.ch/school/graphs/")

(define-namespace school "http://mu.semte.ch/vocabularies/school/")

(define-constraint
  'read/write
  (lambda ()
    (let ((session (header 'mu-session-id)))
      (if session
          (format
           (conc "CONSTRUCT { "
                 "  ?s ?p ?o."
                 "} "
                 "WHERE {"
                 "  { "
                 "    GRAPH ?graph {"
                 "      ?s ?p ?o."
                 "      ?s rdf:type ?type "
                 "    }"
                 "    FILTER ( ?type != school:Grade ) "
                 "  }"
                 "  UNION "
                 "  { "
                 "    GRAPH ?graph { "
                 "      ?s ?p ?o."
                 "      ?s rdf:type ?type. "
                 "      ?s school:gradeRecipient ?student "
                 "    } "
                 "    FILTER ( ?type = school:Grade ) "
                 "    { "
                 "      SELECT DISTINCT ?student "
                 "      WHERE { "
                 "        {  "
                 "          GRAPH graphs:auth { <~A> school:sessionUser ?student } "
                 "        }"
                 "        UNION { "
                 "          GRAPH graphs:auth { <~A> school:sessionUser ?user } "
                 "          GRAPH graphs:people { ?user school:role \"principle\" } "
                 "        }"
                 "        UNION { "
                 "          GRAPH graphs:auth { <~A> school:sessionUser ?user }"
                 "          GRAPH graphs:classes { "
                 "            ?class school:teacher ?user ."
                 "            ?class school:student ?currentStudent "
                 "          } "
                 "        } "
                 "      } "
                 "    } "
                 "  } " 
                 "  VALUES (?graph ?type) { "
                 "    (graphs:subjects school:Subject) "
                 "    (graphs:classes school:Class) "
                 "    (graphs:people school:Person) "
                 "    (graphs:grades school:Grade) "
                 "  }"
                 "}")
           session session session
           )
          (conc "CONSTRUCT {"
                "  ?s ?p ?o."
                "} "
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
                "}")))))

(define (set-session-user session uuid)
  (sparql-update (conc "INSERT { "
                       "  GRAPH graphs:auth {"
                       "    <~A> school:sessionUser ?user "
                       "  } "
                       "} "
                       "WHERE { "
                       "  ?user mu:uuid \"~A\""
                       "}")
                 session uuid))

(define (delete-session-user session)
  (sparql-update (conc "DELETE WHERE { GRAPH graphs:auth { <~A> school:sessionUser ?user } }")
                 session))

(define change-session-user-call 
  (rest-call
   (uuid)
   (let ((session (header 'mu-session-id)))
     (set-session-user session uuid))))

(define delete-session-user-call
  (rest-call
   ()
   (let ((session (header 'mu-session-id)))
     (delete-session-user session))))

(define-rest-call 'POST '("user" uuid) change-session-user-call)

(define-rest-call 'GET '("user" uuid) change-session-user-call)

(define-rest-call 'DELETE '("user") delete-session-user-call)
