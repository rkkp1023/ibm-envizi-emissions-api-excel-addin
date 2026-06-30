@Library(['ai-apps-shared-pipeline', 'ei-offering-config']) _

sterlingPipeline {
    repoName = "ibm-envizi-emissions-api-excel-addin-internal"
    minikubeTestEnabled = false
    agentLabel = null
    nodeversion = '22'
    yarnLintCommand = { sh 'echo "ignoring lint"' }
    yarnBuildCommand = { sh 'yarn build'}
    detectSecretsEnabled = true
    dockerBuildEnabled = false
    repoValidationEnabled = false
    semanticReleaseBuildFiles = true
    deploymentEnabled = false
    sonarQubeAdditionalProperties = {[
        "project.settings":"./sonar-project.properties"
    ]}
    caseCheckVulnsIgnoreList = 'bom.json'
    acceptableFailedStageList = null

    // only run the upload on a PR merge build to main (dev) or prod
    uploadArtifactEnabled = getValue(delegate, 'branchName') in ['main', 'prod'] 
    uploadArtifactCommand = {
        // install AWS CLIv2
        sh 'mkdir -p /tmp/awscli'
        // okay to hardcode architecture to x86 since our build servers are that
        sh 'curl -fLo /tmp/awscli/awscliv2.zip "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-2.34.53.zip"'
        sh 'unzip /tmp/awscli/awscliv2.zip -d /tmp/awscli'
        sh 'sudo /tmp/awscli/aws/install --update'

        if (getValue(delegate, 'branchName') == 'main') {
            withCredentials([usernamePassword(credentialsId: getValue(delegate, 'cosPublishCredentials'), passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                // Now copy up the dist folder into the ghg-deploy-dev bucket
                sh 'ls -l ./dist'
                sh 'aws --endpoint https://s3.us.cloud-object-storage.appdomain.cloud s3 sync --delete ./dist s3://ghg-plugins-dev --acl public-read'
            }
        }

        if (getValue(delegate, 'branchName') == 'prod') {
            withCredentials([usernamePassword(credentialsId: getValue(delegate, 'prodCosPublishCredentials'), passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                // Now copy up the dist folder into the ei-ghg-plugins-production bucket
                sh 'ls -l ./dist'
                sh 'aws --endpoint https://s3.us.cloud-object-storage.appdomain.cloud s3 sync --delete ./dist s3://ei-ghg-plugins-production --acl public-read'
            }
        }
    }
}
