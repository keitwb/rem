pipeline {
    agent none

    stages {
        stage('tests') {
            parallel {
                stage('integration-tests') {
                    agent {
                        dockerfile {
                            dir 'integration_tests'
                            args '-v $HOME/.npm:/root/.npm -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    environment {
                        QUAY_IO_BOT = credentials("quay-rem-jenkins")
                    }
                    steps { dir('integration_tests') {
                        withCredentials([[$class: "FileBinding", credentialsId: 'rem-int-tests-kubeconfig', variable: 'KUBECONFIG']]) {
                            sh '''
                              docker login -u="$QUAY_IO_BOT_USR" -p="$QUAY_IO_BOT_PSW" quay.io
                              npm install

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
                        docker {
                            image 'python:3.7'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('search') {
                        sh 'pip install pipenv==2018.7.1'
                        sh 'pipenv install --deploy --dev --system'

                        sh 'pipenv run pytest -n2 remsearch/inttest'
                    }}
                }
                stage('data-streamer-test') {
                    agent {
                        docker {
                            image 'python:3.7'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('data-streamer') {
                        sh 'pip install pipenv==2018.7.1'
                        sh 'pipenv install --deploy --dev --system'

                        sh 'pipenv run pytest -n2 remdata/inttest'
                    }}
                }
                stage('search-pylint') {
                    agent {
                        docker {
                            image 'python:3.7'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('search') {
                        sh 'pip install pipenv==2018.7.1'
                        sh 'pipenv install --deploy --dev --system'

                        sh 'pipenv run pylint remsearch'
                    }}
                }
                stage('search-black-formatting') {
                    agent {
                        docker {
                            image 'python:3.7'
                            args '-v $HOME/.cache/pip:/root/.cache/pip'
                        }
                    }
                    steps { dir('search') {
                        sh 'pip install pipenv==2018.7.1'
                        sh 'pipenv install --deploy --dev --system'

                        sh 'pipenv run black --check remsearch'
                    }}
                }
                stage('data-streamer-pylint') {
                    agent {
                        docker {
                            image 'python:3.7'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('data-streamer') {
                        sh 'pip install pipenv==2018.7.1'
                        sh 'pipenv install --deploy --dev --system'

                        sh 'pipenv run pylint remdata'
                    }}
                }
                stage('data-streamer-black-formatting') {
                    agent {
                        docker {
                            image 'python:3.7'
                            args '-v $HOME/.cache/pip:/root/.cache/pip'
                        }
                    }
                    steps { dir('data-streamer') {
                        sh 'pip install pipenv==2018.7.1'
                        sh 'pipenv install --deploy --dev --system'

                        sh 'pipenv run black --check remdata'
                    }}
                }
                stage('webapp-prettier-check') {
                    agent {
                        docker {
                            image 'node:10.11-alpine'
                            args '-v $HOME/.npm:/root/.npm'
                        }
                    }
                    steps { dir('webapp') {
                        sh 'npm install prettier'
                        sh './node_modules/.bin/prettier --list-different ./src/**/*'
                    }}
                }
                stage('webapp-jest-tests') {
                    agent {
                        docker {
                            image 'node:10.11-alpine'
                            args '-v $HOME/.npm:/root/.npm'
                        }
                    }
                    steps { dir('webapp') {
                        sh 'npm install'
                        sh './node_modules/.bin/jest --ci'
                    }}
                }
            }
        }
    }
}
