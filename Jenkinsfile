pipeline {
    
    agent any

    environment {
        DEPLOY_BRANCH = "main"
        S3_BUCKET = "songyeoin-jenkins-ci-cd"
        CLOUDFRONT_DISTRIBUTION_ID = "E3CWY1GSP7ZUEB"
        AWS_CREDENTIALS = 'aws-credentials'
    }
    
    stages {
        
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Check Branch') {
            steps {
                script {
                    env.GIT_BRANCH = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    echo "Current branch is ${env.GIT_BRANCH}"
                }
            }
        }

        stage('Check Node/NPM') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }
        
        stage('Install Dependencies') {
            when {
                expression { env.GIT_BRANCH?.contains(env.DEPLOY_BRANCH) }
            }
            steps {
                sh 'npm install'
            }
        }
        
        stage('Build') {
            when {
                expression { env.GIT_BRANCH?.contains(env.DEPLOY_BRANCH) }
            }
            steps {
                sh 'CI=false npm run build'
            }
        }
        
        stage('Deploy to S3') {
            when {
                expression { env.GIT_BRANCH?.contains(env.DEPLOY_BRANCH) }
            }
            steps {
                withAWS(credentials: "${env.AWS_CREDENTIALS}", region: 'ap-northeast-2') {
                     // ✅ 기존 파일 전체 삭제
                    sh "aws s3 rm s3://${env.S3_BUCKET}/ --recursive"
        
                    // ✅ 새 빌드 결과물 업로드
                    s3Upload(
                        bucket: "${env.S3_BUCKET}",
                        path: '', // 루트에 바로 업로드
                        includePathPattern: '**/*',
                        workingDir: 'build'
                    )
                }
            }
        }
        
        stage('Invalidate CloudFront') {
            steps {
                withAWS(credentials: "${env.AWS_CREDENTIALS}", region: 'ap-northeast-2') {
                    // CloudFront 캐시 무효화
                    cfInvalidate(distribution: "${env.CLOUDFRONT_DISTRIBUTION_ID}", 
                                 paths: ['/*'])
                }
            }
        }
    }
    
    post {
        success {
            echo "배포가 성공적으로 완료되었습니다!!"
        }
        failure {
            echo "배포 중 오류가 발생했습니다.."
        }
    }
}
