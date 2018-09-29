pipeline {
    agent none

    stages {
        stage('python-tests') {
            parallel {
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
                stage('search-yapf-formatting') {
                    agent {
                        docker {
                            image 'python:3.7'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('search') {
                        sh 'pip install pipenv==2018.7.1'
                        sh 'pipenv install --deploy --dev --system'

                        sh 'pipenv run yapf --diff --recursive --parallel remsearch'
                    }}
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
                stage('data-streamer-yapf-formatting') {
                    agent {
                        docker {
                            image 'python:3.7'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('data-streamer') {
                        sh 'pip install pipenv==2018.7.1'
                        sh 'pipenv install --deploy --dev --system'

                        sh 'pipenv run yapf --diff --recursive --parallel remdata'
                    }}
                }
            }
        }
    }
}
