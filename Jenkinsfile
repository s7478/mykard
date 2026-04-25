pipeline {
    agent any

    environment {
        // Variables for Docker Image
        DOCKER_IMAGE = "mykard-app"
        DOCKER_REGISTRY = "shantanu078" //shantanu// Changed to your actual Docker Hub username
        DOCKER_TAG = "${env.BUILD_ID}"
    }

    tools {
        nodejs 'node20' // We will need to configure NodeJS in Jenkins Global Tool Configuration
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from Git
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // Connects to the SonarQube server running on port 9000
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv() {
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=mykard-app \
                            -Dsonar.projectName=MyKard \
                            -Dsonar.sources=src \
                            -Dsonar.exclusions=node_modules/**"
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} ."
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                // Scan the built image
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        stage('Docker Push') {
            steps {
                // Push image to Docker Hub
                withCredentials([usernamePassword(credentialsId: 'shantanu078', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo "Deploying live to EC2 instance..."
                script {
                    // Stop and remove the old running container (if any)
                    sh "docker rm -f mykard-live || true"
                    
                    // Run the new container on port 3000
                    sh "docker run -d --name mykard-live -p 3000:3000 ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                }
            }
        }
    }

    post {
        always {
            // Clean up the Jenkins workspace to save disk space
            cleanWs()
        }
    }
}
