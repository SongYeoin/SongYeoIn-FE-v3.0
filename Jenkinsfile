pipeline {
    agent any
    environment {
        DEPLOY_BRANCH = "main"
        S3_BUCKET = "songyeoin-jenkins-ci-cd"
        CLOUDFRONT_DISTRIBUTION = "E3CWY1GSP7ZUEB"
        AWS_CREDENTIALS = 'aws-credentials'  // 추가: AWS 자격증명 ID
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
                // AWS 자격증명을 사용하는 블록 추가
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
