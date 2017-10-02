(in-package :mu-cl-resources)

;;;;
;; NOTE
;; docker-compose stop; docker-compose rm; docker-compose up
;; after altering this file.

;; Describe your resources here

;; The general structure could be described like this:
;;
;; (define-resource <name-used-in-this-file> ()
;;   :class <class-of-resource-in-triplestore>
;;   :properties `((<json-property-name-one> <type-one> ,<triplestore-relation-one>)
;;                 (<json-property-name-two> <type-two> ,<triplestore-relation-two>>))
;;   :has-many `((<name-of-an-object> :via ,<triplestore-relation-to-objects>
;;                                    :as "<json-relation-property>")
;;               (<name-of-an-object> :via ,<triplestore-relation-from-objects>
;;                                    :inverse t ; follow relation in other direction
;;                                    :as "<json-relation-property>"))
;;   :has-one `((<name-of-an-object :via ,<triplestore-relation-to-object>
;;                                  :as "<json-relation-property>")
;;              (<name-of-an-object :via ,<triplestore-relation-from-object>
;;                                  :as "<json-relation-property>"))
;;   :resource-base (s-url "<string-to-which-uuid-will-be-appended-for-uri-of-new-items-in-triplestore>")
;;   :on-path "<url-path-on-which-this-resource-is-available>")


;; An example setup with a catalog, dataset, themes would be:
;;
;; (define-resource catalog ()
;;   :class (s-prefix "dcat:Catalog")
;;   :properties `((:title :string ,(s-prefix "dct:title")))
;;   :has-many `((dataset :via ,(s-prefix "dcat:dataset")
;;                        :as "datasets"))
;;   :resource-base (s-url "http://webcat.tmp.semte.ch/catalogs/")
;;   :on-path "catalogs")

;; (define-resource dataset ()
;;   :class (s-prefix "dcat:Dataset")
;;   :properties `((:title :string ,(s-prefix "dct:title"))
;;                 (:description :string ,(s-prefix "dct:description")))
;;   :has-one `((catalog :via ,(s-prefix "dcat:dataset")
;;                       :inverse t
;;                       :as "catalog"))
;;   :has-many `((theme :via ,(s-prefix "dcat:theme")
;;                      :as "themes"))
;;   :resource-base (s-url "http://webcat.tmp.tenforce.com/datasets/")
;;   :on-path "datasets")

;; (define-resource distribution ()
;;   :class (s-prefix "dcat:Distribution")
;;   :properties `((:title :string ,(s-prefix "dct:title"))
;;                 (:access-url :url ,(s-prefix "dcat:accessURL")))
;;   :resource-base (s-url "http://webcat.tmp.tenforce.com/distributions/")
;;   :on-path "distributions")



(define-resource person ()
  :class (s-prefix "xmlns:Person")
  :properties `((:name :string ,(s-prefix "xmlns:name"))
                (:email :string ,(s-prefix "xmlns:mbox"))
                (:role :string ,(s-prefix "school:role")))
  :has-many `((class :via ,(s-prefix "school:hasTeacher")
                             :as "classesTaught"
                             :inverse t)
              (class :via ,(s-prefix "school:hasStudent")
                            :as "classesTaken"
                            :inverse t)
              (grade :via ,(s-prefix "gradeRecipient")
                      :as "earnedGrades"
                      :inverse t))
  :resource-base (s-url "http://mu.semte.ch/school/people/")
  :on-path "people")

(define-resource subject ()
  :class (s-prefix "school:Subject")
  :properties `((:name :string ,(s-prefix "dct:title")))
  :resource-base (s-url "http://mu.semte.ch/school/subjects/")
  :has-many `((class :via ,(s-prefix "dct:subject")
                     :as "classes"
                     :inverse t))
  :on-path "subjects")

(define-resource class ()
  :class (s-prefix "school:Class")
  :properties `((:name :string ,(s-prefix "dct:title"))
                (:subject :string ,(s-prefix "dct:subject")))
  :has-many `((person :via ,(s-prefix "school:teacher")
                      :as  "teachers")
              (person :via ,(s-prefix "school:student")
                      :as  "students")
              (grade :via ,(s-prefix "school:classGrade")
                     :as  "grades"))
  :resource-base (s-url "http://mu.semte.ch/school/classes/")
  :on-path "classes")

(define-resource grade ()
  :class (s-prefix "school:Grade")
  :properties `((:points :number ,(s-prefix "school:gradePoints")))
  :resource-base (s-url "http://mu.semte.ch/school/grades/")
  :has-one `((person :via ,(s-prefix "school:gradeRecipient")
                     :as "student")
             (class :via ,(s-prefix "school:classGrade")
                    :as "class"
                    :inverse t))
  :on-path "grades")

