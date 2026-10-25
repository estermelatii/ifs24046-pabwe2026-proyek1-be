pipeline {
  agent any
  tools { nodejs 'node20' }   // sesuaikan dengan nama NodeJS di Jenkins > Tools (Node 20 atau lebih baru)
  stages {
    stage('Install') { steps { sh 'npm ci || npm install' } }
    stage('Test')    { steps { sh 'npm test' } }
  }
  post {
    success { echo 'Install dan test back-end berhasil' }
    failure { echo 'Pipeline gagal, cek log' }
  }
}
