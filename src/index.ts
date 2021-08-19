import AWS, { AWSError } from "aws-sdk";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { SendCommandResult } from "aws-sdk/clients/ssm";

try {
  const inputs = SanitizeInputs();

  // AWS Configure
  AWS.config.update({
    accessKeyId: inputs.accessKeyId,
    secretAccessKey: inputs.secretAccessKey,
    region: inputs.region,
  });

  // Run Send Command
  const ssm = new AWS.SSM();
  ssm.sendCommand();
  ssm.sendCommand(
    {
      Targets: inputs.targets,
      DocumentName: inputs.documentName,
      Comment: inputs.comment,
      Parameters: {
        workingDirectory: [inputs.workingDirectory],
        commands: [inputs.command],
      },
    },
    (err: AWSError, data: SendCommandResult) => {
      if (err) throw err;

      console.log(data);

      core.setOutput("command-id", data.Command?.CommandId);
    }
  );
} catch (err) {
  console.error(err, err.stack);
  core.setFailed(err);
}

function SanitizeInputs() {
  // AWS
  const _accessKeyId = core.getInput("aws-access-key-id", { required: true });
  const _secretAccessKey = core.getInput("aws-secret-access-key", {
    required: true,
  });
  const _region = core.getInput("aws-region", { required: true });

  // SSM Send Command
  const _targets = core.getInput("targets");
  const _command = core.getInput("command");
  const _workingDirectory = core.getInput("working-directory");
  const _comment = core.getInput("comment");

  // customized not supported yet, will be updated soon.
  const _documentName = "AWS-RunShellScript";
  const _outputS3BucketName = "your-s3-bucket-name";
  const _outputS3KeyPrefix = "your-s3-bucket-directory-name";

  return {
    accessKeyId: _accessKeyId,
    secretAccessKey: _secretAccessKey,
    region: _region,
    targets: JSON.parse(_targets),
    command: _command,
    documentName: _documentName,
    workingDirectory: _workingDirectory,
    comment: _comment,
  };
}
