pipeline {
    agent any
    environment {
        DEPLOY_BRANCH = "main"
        S3_BUCKET = "songyeoin-jenkins-ci-cd"
        CLOUDFRONT_DISTRIBUTION = "E3CWY1GSP7ZUEB"
        AWS_CREDENTIALS = 'aws-credentials'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/SongYeoin/SongYeoIn-FE-v3.0.git'
            }
        }
        stage('Prepare Environment') {
            steps {
                echo "Injecting environment variables..."
                withCredentials([
                    string(credentialsId: 'react-app-api-url', variable: 'API_URL'),
                    string(credentialsId: 'react-app-discord-webhook', variable: 'WEBHOOK_URL')
                ]) {
                    sh '''
                    echo "REACT_APP_API_URL=$API_URL" > .env.production
                    echo "REACT_APP_DISCORD_WEBHOOK_URL=$WEBHOOK_URL" >> .env.production
                    cat .env.production
                    echo ".env.production file created."
                    '''
                }
            }
        }
        stage('build') {
            steps {
                echo "Building frontend application..."
                sh '''
                export CI=false
                npm install
                npm run build
                '''
            }
        }
        stage('deploy') {
            when {
                branch DEPLOY_BRANCH
            }
            steps {
                withAWS(credentials: AWS_CREDENTIALS, region: 'ap-northeast-2') {
                    echo "Deploying frontend to S3..."
                    sh """
                    aws s3 sync ./build s3://${S3_BUCKET} --delete
                    aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION} --paths "/*"
                    """
                }
            }
        }
    }
}
