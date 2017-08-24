(use mu-chicken-support)

(define *realm-id-graph*
  (config-param "REALM_ID_GRAPH" '<http://data.europa.eu/eurostat/uuid> read-uri))

(define *session-realm-ids* (make-hash-table))

(define *realm* (make-parameter #f))

(define (query-graph-realm)
  (or (*realm*) ;; for testing
      (header 'mu-graph-realm)
      (get-realm (header 'mu-graph-realm-id))
      (get-realm (($query) 'graph-realm-id))
      (($query) 'graph-realm)
      (($body) 'graph-realm)
      (get-realm (hash-table-ref/default *session-realm-ids* (header 'mu-session-id) #f))))

(define (get-realm realm-id)
  (and realm-id
       (query-unique-with-vars
        (realm)
        (format "SELECT ?realm
                 FROM ~A
                 WHERE { ?realm mu:uuid ~A }"
                (*realm-id-graph*) 
                (write-sparql realm-id))
        realm)))

(define (graph-rule-realm realm)
  (if realm
      (format (conc "{ ?rule rewriter:graph ?graph } "
                    "UNION " 
                    "{"
                    " ?rule rewriter:graphType ?gtype."
                    " ?graph rewriter:type ?gtype."
                    " ?graph rewriter:realm ~A "
                    "}")
              realm)
      "?rule rewriter:graph ?graph."))

(define (all-graphs-realm realm)
  (if realm
      (format (conc "{ "
                    " SELECT DISTINCT ?allGraphs WHERE { "
                    "  GRAPH <http://data.europa.eu/eurostat/graphs> {"
                    "   { ?rule rewriter:graph ?allGraphs } "
                    "   UNION "
                    "   { "
                    "    ?rule rewriter:graphType ?gtype."
                    "    ?allGraphs rewriter:type ?gtype."
                    "    ?allGraphs rewriter:realm ~A "
                    "   } "
                    "  } "
                    " }"
                    "}")
              realm)
      " GRAPH <http://data.europa.eu/eurostat/graphs> { ?allGraphs a rewriter:Graph } "))

(*constraint*
 (lambda ()
   (let ((realm (query-graph-realm)))
     (format (conc "CONSTRUCT { ?s ?p ?o } "
                   " WHERE { "
                   " { "
                   "  SELECT DISTINCT ?graph ?type ?p"
                    " WHERE { "
                    "   GRAPH <http://data.europa.eu/eurostat/graphs> { "
                    "    ?rule a rewriter:GraphRule. "
                    "    ?graph a rewriter:Graph. "
                    "    ~A "
                    "    ?rule rewriter:predicate ?p. "
                    "    ?rule rewriter:subjectType ?type. "
                    "   }"
                    "  }"
                    " } "
                    " ~A "
                    " GRAPH ?allGraphs { ?s rdf:type ?type } "
                    " GRAPH ?graph { ?s ?p ?o } "
                    "} ")
              (graph-rule-realm realm)
              (all-graphs-realm realm)))))

;; (*constraint* '(@QueryUnit (@Query (@Prologue) (CONSTRUCT (?s ?p ?o)) (@Dataset) (WHERE ((@SubSelect (|SELECT DISTINCT| ?graph ?type) (WHERE (GRAPH <http://data.europa.eu/eurostat/graphs> (?rule a rewriter:GraphRule) (?graph a rewriter:Graph) ((?rule rewriter:graph ?graph)) (?rule rewriter:predicate ?p) (?rule rewriter:subjectType ?type))))) (GRAPH <http://data.europa.eu/eurostat/graphs> (?allGraphs a rewriter:Graph)) (GRAPH ?allGraphs (?s rdf:type ?type)) (GRAPH ?graph (?s ?p ?o))))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Additional Endpoints
(define change-session-realm-call 
  (rest-call
   (realm-id)
   (let ((mu-session-id (header-value 'mu-session-id (request-headers (current-request)))))
     (log-message "~%Changing graph-realm-id for mu-session-id ~A to ~A~%"
                  mu-session-id realm-id)
     (hash-table-set! *session-realm-ids* mu-session-id realm-id)
     `((mu-session-id . ,mu-session-id)
       (realm-id . ,realm-id)))))

(define (delete-session-realm-call _)
  (let ((mu-session-id (header-value 'mu-session-id (request-headers (current-request)))))
    (log-message "~%Removing graph-realm-id for mu-session-id ~A to ~A~%"
                 mu-session-id realm-id)
    (hash-table-delete! *session-realm-ids* mu-session-id)
    `((mu-session-id . ,mu-session-id)
      (realm-id . #f))))

(define (add-realm realm graph graph-type)
  (sparql-update
   (s-insert
    (write-triples
     `((,graph rewriter:realm ,realm)
       (,graph a rewriter:Graph)
       (,graph rewriter:type ,graph-type))))))

(define (add-realm-call _)
  (let* ((req-headers (request-headers (current-request)))
         (body (read-request-json))
         (realm (or (read-uri (alist-ref 'graph-realm body))
                    (get-realm (alist-ref 'graph-realm-id body))))
         (graph-type (read-uri (alist-ref 'graph-type body)))
         (graph (read-uri (alist-ref 'graph body))))
    (log-message "~%Adding graph-realm ~A for ~A  ~%" realm graph)
    (add-realm realm graph graph-type)
    (hash-table-delete! *cache* '(graphs #f))
    `((status . "success")
      (realm . ,(write-uri realm)))))

(define (delete-realm realm graph)
  (sparql-update
   (if graph
       (s-delete
        (write-triples `((,graph ?p ?o)))
        where: (write-triples `((,graph ?p ?o))))
       (s-delete
        (write-triples `((?graph ?p ?o)))
        where: (write-triples `((?graph rewriter:realm ,realm)
                                (?graph ?p ?o)))))))

(define (delete-realm-call _)
  (let* ((req-headers (request-headers (current-request)))
         (body (read-request-json))
         (realm (or (read-uri (alist-ref 'graph-realm body))
                    (get-realm (alist-ref 'graph-realm-id body))))
         (graph (read-uri (alist-ref 'graph body))))
    (log-message "~%Deleting graph-realm for ~A or ~A  ~%" realm graph)
    (hash-table-delete! *cache* '(graphs #f))
    (delete-realm realm graph)))

(define-rest-call 'PATCH '("session" "realm" realm-id) change-session-realm-call)

(define-rest-call 'DELETE '("session" "realm") delete-session-realm-call)

(define-rest-call 'POST '("realm") add-realm-call)
(define-rest-call 'POST '("realm" realm-id) add-realm-call)

(define-rest-call 'DELETE '("realm") delete-realm-call)
(define-rest-call 'DELETE '("realm" realm-id) delete-realm-call)
