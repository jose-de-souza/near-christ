(defproject backend "0.1.0-SNAPSHOT"
  :description "Near Christ Backend in Clojure"
  :url "https://github.com/your-org/backend"
  :license {:name "MIT License"
            :url "https://opensource.org/licenses/MIT"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [http-kit "2.7.0"]
                 [metosin/reitit-ring "0.7.0"]
                 [com.github.seancorfield/next.jdbc "1.3.1070"]
                 [hikari-cp "2.13.0"]
                 [org.postgresql/postgresql "42.7.1"]
                 [org.flywaydb/flyway-core "10.20.1"]
                 [buddy/buddy-sign "3.0.0" :exclusions [org.bouncycastle/bcprov-jdk15on org.bouncycastle/bcpkix-jdk15on]]
                 [buddy/buddy-hashers "2.0.167" :exclusions [org.bouncycastle/bcprov-jdk15on org.bouncycastle/bcpkix-jdk15on]]
                 [org.bouncycastle/bcprov-jdk18on "1.78.1"]
                 [org.bouncycastle/bcpkix-jdk18on "1.78.1"]
                 [cheshire "5.12.0"]
                 [ring-cors "0.1.13"]
                 [ring/ring-defaults "0.3.3"]
                 [environ "1.2.0"]
                 [ch.qos.logback/logback-classic "1.4.14"]]  ;; SLF4J binder for Flyway/logging
  :main ^:skip-aot backend.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :uberjar-name "backend-standalone.jar"
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}
             :dev {:dependencies [[ring/ring-mock "0.4.0"]
                                  [org.clojure/test.check "1.1.1"]]}}
  :plugins [[lein-environ "1.2.0"]])