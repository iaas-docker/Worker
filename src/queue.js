const QUEUE_URL = "https://sqs.sa-east-1.amazonaws.com/916203701249/iaas-queue.fifo";
const NonExistingQueueCode = 'AWS.SimpleQueueService.NonExistentQueue';
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
        "MessageGroupId"
      ],
      MaxNumberOfMessages: 1,
      QueueUrl: QUEUE_URL,
      VisibilityTimeout: 10,
      WaitTimeSeconds: 0
    };
    
    sqs.receiveMessage(params).promise().then(data => {
      resolve(data);
    }).catch(err => {
      reject(err)
    });
  });
};

module.exports.getQueueUrl = async function (machineId) {
  let params = {
    QueueName: machineId+'.fifo'
  };
  try{
    let result = await sqs.getQueueUrl(params).promise();
    return result.QueueUrl;
  } catch (err){
    if (err.code == NonExistingQueueCode){
      return await createQueue(machineId);
    } else {
      throw err;
    }
  }
}

async function createQueue(machineId){
  let params = {
    QueueName: machineId+'.fifo',
    Attributes: {
      'FifoQueue': 'true',
      'ContentBasedDeduplication': 'true'
    }
  };
  try {
    let queue = await sqs.createQueue(params).promise();
    return queue.QueueUrl;
  } catch (err) { throw err; }
}

module.exports.sendMessage = function(message, action, queueUrl){
  return new Promise((resolve, reject) => {
    let params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: queueUrl,
      MessageGroupId: action
    };

    sqs.sendMessage(params).promise().then(data => {
      resolve(data);
    }).catch(err => {
      reject(err)
    });
  });
};

module.exports.deleteMessage = async function(receiptHandle){
    let deleteParams = {
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle
    };
    sqs.deleteMessage(deleteParams).promise().then(data => {
      return data;
    }).catch(err => {
      throw err;
    })
};

