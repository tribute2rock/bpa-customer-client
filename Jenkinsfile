pipeline {
    agent any // You can specify the type of agent here, e.g., 'agent { docker { image "node:latest" } }' to use a Docker container with Node.js installed

    environment {
        CI = 'false'
    }

    stages {
        stage("Build") {
            steps {
                // Install dependencies
                bat 'npm i --legacy-peer-deps'
                
                // Build the project
                bat 'npm run build'
                
                // Copy build output to another directory
                bat 'xcopy /s /e /y E:\\JenkinsHome\\workspace\\bpa-customer-client\\build E:\\JenkinsHome\\workspace\\bpa-customer-api\\public'
            }
        }
    }
}
