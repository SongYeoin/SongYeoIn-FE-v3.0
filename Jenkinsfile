pipeline {
    agent any
    environment {
        DEPLOY_BRANCH = "main"
        S3_BUCKET = "songyeoin-jenkins-ci-cd"
        CLOUDFRONT_DISTRIBUTION = "E3CWY1GSP7ZUEB"
    }
    stages {
        stage('build') {
            steps {
                echo "Building frontend application..."
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('deploy') {
            when {
                branch DEPLOY_BRANCH
            }
            steps {
                echo "Deploying frontend to S3..."
                sh """
                aws s3 sync ./build s3://${S3_BUCKET} --delete
                aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION} --paths "/*"
                """
            }
        }
    }
}
