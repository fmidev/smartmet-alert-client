#!groovy

def packageVersion = "undefined"
def deployUserAndHost = "${params.deployUserAndHost}"
def deployBaseDirectory = "${params.deployBaseDirectory}"
def buildNode = "${params.buildNode}"

pipeline {

    agent {
        node {
            label "${buildNode}"
        }
    }

    tools {
        nodejs 'nodejs-14'
    }

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '3'))
    }

    stages {
        stage('Configure http proxy') {
            when { expression { env.HTTP_PROXY != '' } }
            steps {
                sh "npm config set proxy ${env.HTTP_PROXY}"
            }
        }

        stage('Configure https proxy') {
            when { expression { env.HTTPS_PROXY != '' } }
            steps {
                sh "npm config set https-proxy ${env.HTTPS_PROXY}"
            }
        }

        stage('Install') {
            steps {
                sh "env"
                sh "npm --version"
                sh "node --version"
                sh "rm --recursive --force node_modules"
                sh "npm install"
            }
        }

        stage('Build') {
            steps {
                sh "npm run build"
            }
        }

        stage('Test') {
            steps {
                sh "docker stop docker_chromium_1 || true && docker rm docker_chromium_1 || true"
                sh "npm test || echo \"Some or all tests failed\""
            }
        }

        stage('Determine version from package.json') {
            steps {
                script {
                     packageVersion = sh(returnStdout: true, script: 'jq --raw-output .version package.json').trim()
                }
            }
        }

        stage('Require unique deploy directory') {
            when { environment name: 'BRANCH_NAME', value: 'main' }
            steps {
                sh "ssh ${deployUserAndHost} \"if [ -d ${deployBaseDirectory}/${packageVersion} ]; then echo deploy directory already exists; exit 1; fi\""
            }
        }

        stage('Deploy') {
            steps {
                sh "chmod --verbose --recursive u+r+w+X,g+r-w+X,o-r-w-x dist/"
                sh "ssh ${deployUserAndHost} \"mkdir --parents --mode=750 ${deployBaseDirectory}/${packageVersion}\""
                sh "scp -rp dist/* ${deployUserAndHost}:${deployBaseDirectory}/${packageVersion}/"
            }
        }

        stage('Publish package to npmjs.com') {
            when { environment name: 'BRANCH_NAME', value: 'main' }
            environment {
                NPM_TOKEN = credentials('npm-token')
            }
            steps {
                sh 'echo //registry.npmjs.org/:_authToken=$NPM_TOKEN > .npmrc'
                sh 'npm publish'
                sh 'rm .npmrc'
            }
        }
    }

    post {
        success {
            slackSend(message: "Success ${env.JOB_NAME} ${packageVersion} (<${env.BUILD_URL}|Open>)")
        }
        unstable {
            slackSend(message: "Unstable ${env.JOB_NAME} ${packageVersion} (<${env.BUILD_URL}|Open>)")
        }
        failure {
            slackSend(message: "Failure ${env.JOB_NAME} ${packageVersion} (<${env.BUILD_URL}|Open>)")
        }
        changed {
            slackSend(message: "Changed ${env.JOB_NAME} ${packageVersion} (<${env.BUILD_URL}|Open>)")
        }
    }
}
