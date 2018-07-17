pipeline {
    agent none

    stages {
        stage('python-tests') {
            parallel {
                stage('search-pylint') {
                    agent {
                        docker {
                            image 'python:3.6'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('search') {
                        sh 'pip install -r requirements.txt -r test_requirements.txt'

                        sh 'pylint remsearch'
                    }}
                }
                stage('search-yapf-formatting') {
                    agent {
                        docker {
                            image 'python:3.6'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('search') {
                        sh 'pip install -r requirements.txt -r test_requirements.txt'

                        sh 'yapf --diff --recursive --parallel remsearch'
                    }}
                }
                stage('search-test') {
                    agent {
                        docker {
                            image 'python:3.6'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('search') {
                        sh 'pip install -r requirements.txt -r test_requirements.txt'

                        sh 'pytest -n3 remsearch/inttest'
                    }}
                }
                stage('update-streamer-test') {
                    agent {
                        docker {
                            image 'python:3.6'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('update-streamer') {
                        sh 'pip install -r requirements.txt -r test_requirements.txt'

                        sh 'pytest -n3 remupdates/inttest'
                    }}
                }
                stage('update-streamer-pylint') {
                    agent {
                        docker {
                            image 'python:3.6'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('update-streamer') {
                        sh 'pip install -r requirements.txt -r test_requirements.txt'

                        sh 'pylint remupdates'
                    }}
                }
                stage('update-streamer-yapf-formatting') {
                    agent {
                        docker {
                            image 'python:3.6'
                            args '-v $HOME/.cache/pip:/root/.cache/pip -v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps { dir('update-streamer') {
                        sh 'pip install -r requirements.txt -r test_requirements.txt'

                        sh 'yapf --diff --recursive --parallel remupdates'
                    }}
                }
            }
        }
    }
}
