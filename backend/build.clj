(ns build
  (:refer-clojure :exclude [test])
  (:require [clojure.tools.build.api :as b]))

(def lib 'backend/backend)
(def version "0.1.0-SNAPSHOT")
(def main 'backend.backend)
(def class-dir "target/classes")

(defn test "Run all the tests." [opts]
      (if (= "false" (System/getenv "CLOJURE_TEST_RUNNER"))
        (do (println "Skipping tests (CLOJURE_TEST_RUNNER=false)")
            opts)
        (let [basis    (b/create-basis {:aliases [:test]})
              cmds     (b/java-command
                         {:basis     basis
                          :main      'clojure.main
                          :main-args ["-m" "cognitect.test-runner"]})
              {:keys [exit]} (b/process cmds)]
             (when-not (zero? exit) (throw (ex-info "Tests failed" {})))
             opts)))  ; Fixed: return opts after let/throw in false branch

(defn- uber-opts [opts]
       (assoc opts
              :lib lib :main main
              :uber-file (format "target/%s-%s.jar" (name lib) version)
              :basis (b/create-basis {})
              :class-dir class-dir
              :src-dirs ["src"]
              :ns-compile [main]))

(defn ci "Run the CI pipeline of tests (and build the uberjar)." [opts]
      (test opts)
      (b/delete {:path "target"})
      (let [opts (uber-opts opts)]
           (println "\nCopying source...")
           (b/copy-dir {:src-dirs ["resources" "src"] :target-dir class-dir})
           (println (str "\nCompiling " main "..."))
           (b/compile-clj opts)
           (println "\nBuilding JAR..." (:uber-file opts))
           (b/uber opts))
      opts)