require('dotenv').config();
const queue = require('./queue');
const mongo = require('./mongo');

getAndProcess();

async function getAndProcess() {
  try {
    let data = await queue.receiveMessage();
    if (data.Messages == undefined) {
      logMessage('No messages to process.');
      setTimeout(getAndProcess, 3000);
    }
    else {
      data = data.Messages;
      let receiptHandle = data[0].ReceiptHandle;
      let instance = JSON.parse(data[0].Body);
      let attributes = data[0].MessageAttributes;

      try {
        let physicalMachine = await mongo.findPhysicalMachine(instance.cores, instance.ram, instance.memory);
        let ipAddress = await mongo.findIpAddress();
        instance.physicalMachineId = physicalMachine._id.toHexString();
        instance.ipAddressId = ipAddress._id.toHexString();

        await mongo.updateInstanceSuccess(instance);
        await mongo.updateIpAddress(instance.ipAddressId);
        await mongo.updatePhysicalMachine(instance.physicalMachineId,
          physicalMachine.freeCores-instance.cores,
          physicalMachine.freeRam-instance.ram,
          physicalMachine.freeMemory-instance.memory
        );
        await queue.sendMessage(instance, 'START', await queue.getQueueUrl(physicalMachine._id));
        logMessage('Finished processing '+instance._id);
      } catch (err){
        logError(err);
        await mongo.updateInstanceError(instance._id, err);
      }

      await queue.deleteMessage(receiptHandle);
      setTimeout(getAndProcess, 1000);
    }
  }
  catch(error){
    logError(error);
    setTimeout(getAndProcess, 3000);
  }
}

function logMessage(message){
  console.log(new Date().getTime()+': '+message);
}

function logError(err){
  console.error(new Date().getTime()+': '+err);
}