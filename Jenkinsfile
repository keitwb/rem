pipeline {
    agent none

    stages {
        stage('tests') {
            parallel {
                stage('integration-tests') {
                    agent {
                        dockerfile {
                            dir 'integration_tests'
                            args '-v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    environment {
                        QUAY_IO_BOT = credentials("quay-rem-jenkins")
                        MONGO_URI = credentials("int-test-mongo-url")
                    }
                    steps { dir('integration_tests') {
                        withCredentials([[$class: "FileBinding", credentialsId: 'rem-int-tests-kubeconfig', variable: 'KUBECONFIG']]) {
                            sh '''
                              docker login -u="$QUAY_IO_BOT_USR" -p="$QUAY_IO_BOT_PSW" quay.io
                              ln -s /app/node_modules $(pwd)/node_modules

                              JUNIT_REPORT_PATH="report.xml" ./run.sh
                            '''
                        }
                    }}
                    // TODO: Figure out how to make it pick up test output in containers
                    //post {
                    //    always {
                    //        junit "*.xml"
                    //    }
                    //}
                }
                stage('search-test') {
                    agent {
                        dockerfile {
                            filename 'pycommon/Dockerfile.test'
                            additionalBuildArgs '--build-arg basedir=search'
                            args '-v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('search') {
                        sh 'pytest -n2 --timeout 180 remsearch/inttest'
                    }}
                }
                stage('data-streamer-test') {
                    agent {
                        dockerfile {
                            filename 'pycommon/Dockerfile.test'
                            additionalBuildArgs '--build-arg basedir=data-streamer'
                            args '-v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('data-streamer') {
                        sh 'pytest -n2 --timeout 180 remdata/inttest'
                    }}
                }
                stage('taxinfo-test') {
                    agent {
                        dockerfile {
                            filename 'pycommon/Dockerfile.test'
                            additionalBuildArgs '--build-arg basedir=tax-info'
                            args '-v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('tax-info') {
                        sh 'pytest --timeout 180 -n2 remtaxinfo'
                    }}
                }
                stage('taxinfo-static-checks') {
                    agent {
                        dockerfile {
                            filename 'pycommon/Dockerfile.test'
                            additionalBuildArgs '--build-arg basedir=tax-info'
                            args '-v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('tax-info') {
                        sh 'pylint remtaxinfo'
                        sh 'black --check remtaxinfo'
                        sh 'mypy remtaxinfo/'
                    }}
                }
                stage('search-static-checks') {
                    agent {
                        dockerfile {
                            filename 'pycommon/Dockerfile.test'
                            additionalBuildArgs '--build-arg basedir=search'
                            args '-v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('search') {
                        sh 'pylint remsearch'
                        sh 'mypy remsearch'
                        sh 'black --check remsearch'
                    }}
                }
                stage('data-streamer-static-checks') {
                    agent {
                        dockerfile {
                            filename 'pycommon/Dockerfile.test'
                            additionalBuildArgs '--build-arg basedir=data-streamer'
                            args '-v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('data-streamer') {
                        sh 'pylint remdata'
                        sh 'black --check remdata'
                    }}
                }
                stage('webapp-prettier-check') {
                    agent {
                        dockerfile {
                            filename 'webapp/Dockerfile.test'
                        }
                    }
                    steps { dir('webapp') {
                        sh 'find src ! -name "*.gen.ts" -and -name "*.ts" -or -name "*.tsx" | xargs prettier --list-different'
                    }}
                }
                stage('webapp-jest-tests') {
                    agent {
                        dockerfile {
                            filename 'webapp/Dockerfile.test'
                        }
                    }
                    steps { dir('webapp') {
                        sh 'ln -s /app/node_modules $(pwd)/node_modules && jest --ci'
                    }}
                }
                stage('model-consistency') {
                    agent {
                        dockerfile {
                            filename 'models/Dockerfile.test'
                        }
                    }
                    steps { dir('models') {
                        sh 'node --version'
                        sh 'bash -x generate.sh'
                        sh 'cd ..; git diff --exit-code'
                    }}
                }
            }
        }
    }
}
