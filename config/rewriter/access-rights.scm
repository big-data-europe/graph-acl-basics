(*constraints* 
 (lambda ()
   (let ((session (header 'mu-session-id)))
     (format (conc "CONSTRUCT {"
                   "  ?s ?p ?o."
                   "}"
                   "WHERE {"
                   "  {"
                   "    GRAPH <http://mu.semte.ch/application> {"
                   "      ?s ?p ?o."
                   "    }"
                   "  }"
                   "  UNION "
                   "  {"
                   "    GRAPH ?graph { "
                   "      ?s ?p ?o."
                   "    } "
                   "  }"
                   " "
                   "  OPTIONAL { "
                   "    GRAPH <http://mu.semte.ch/tmp/special-graphs> {"
                   "      <~A> <http://mu.semte.ch/vocabularies/session/account> ?account."
                   "      ?account <http://mu.semte.ch/tmp/acl/hasSpecialGraph> ?graph."
                   "    }"
                   "  }"
                   "}")
             session))))
