pipeline {
    agent any

    options {
        skipStagesAfterUnstable()
        disableRestartFromStage()
    }

    tools {
        nodejs "nodejs"
    }

    stages {
        stage('install') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm i --force'
            }
        }

        stage('dev-main') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying the software'
                sh 'npm run build'
            }
        }
    }
}
