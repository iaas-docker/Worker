const QUEUE_URL = "https://sqs.sa-east-1.amazonaws.com/916203701249/iaas-queue.fifo";
AWS = require('aws-sdk');

AWS.config.update({
  region: 'sa-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_ACCESS_SECRET,
});

let sqs = new AWS.SQS({apiVersion: '2012-11-05'});

/**
 * Extracts one message from the queue at a time.
 * Waits for the message to be successfully deleted before resolving the promise.
 * Returns: The message with the AWS format if there is at least one message in the queue,
 * Returns: Undefined if there are no messages on the queue
 * @returns {Promise<any>}
 */
module.exports.receiveMessage = function(){
  return new Promise((resolve, reject) => {
    let params = {
      AttributeNames: [
        "SentTimestamp"
      ],
      MaxNumberOfMessages: 1,
      MessageAttributeNames: [
        "All"
      ],
      QueueUrl: QUEUE_URL,
      VisibilityTimeout: 20,
      WaitTimeSeconds: 0
    };
    
    sqs.receiveMessage(params).promise().then(data => {
      if (data.Messages == undefined)
        resolve(undefined);
      else{
        let deleteParams = {
          QueueUrl: QUEUE_URL,
          ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        sqs.deleteMessage(deleteParams).promise().then(data2 => {
          resolve(data.Messages);
        }).catch(err => {
          console.log("Delete Error", err);
        })
      }
    }).catch(err2 => {
      console.log("Receive Error", err2);
    });
  });
};

