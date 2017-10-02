;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Example with rules graph in the database

;; (*constraint*
;;  (conc "CONSTRUCT { ?s ?p ?o } "
;;        "WHERE { "
;;        " {"
;;        "  SELECT DISTINCT ?graph ?type "
;;        "  WHERE { "
;;        "   GRAPH <http://data.europa.eu/eurostat/graphs> { "
;;        "    ?rule a rewriter:GraphRule. "
;;        "    ?graph a rewriter:Graph. "
;;        "    ?rule rewriter:graph ?graph. "
;;        "    ?rule rewriter:predicate ?p. "
;;        "    ?rule rewriter:subjectType ?type. "
;;        "   }"
;;        "  }"
;;        " } "
;;        ""
;;        " GRAPH <http://data.europa.eu/eurostat/graphs> { "
;;        "  ?allGraphs a rewriter:Graph "
;;        " }  "
;;        ""
;;        " GRAPH ?allGraphs { "
;;        "  ?s rdf:type ?type "
;;        " } "
;;        ""
;;        " GRAPH ?graph {"
;;        "  ?s ?p ?o"
;;        " }"
;;        "} "))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; simpler example using VALUES statement

(define-constraint
  'read/write
  (conc 
   "CONSTRUCT { "
   "  ?s ?p ?o. "
   "} "
   "WHERE "
   "{"  
   "  { "
   "    GRAPH ?graph { "
   "      ?s ?p ?o. "
   "   } "
   "    VALUES (?graph ?p) { (<http://data.europa.eu/eurostat/uuid>  mu:uuid)  } "
   "  } "
   "  UNION "
   "  { "
   "    GRAPH ?graph { "
   "      ?s ?p ?o. "
   "      ?s rdf:type ?type. "
   "   } "
   "    VALUES (?graph ?type) { (<http://data.europa.eu/eurostat/retailers> dct:Agent) (<http://data.europa.eu/eurostat/datasets> qb:Dataset ) } "
   "   FILTER ( ?p != mu:uuid )"
   "  }"
   "}"))
