require('dotenv').config();
const queue = require('./queue.js');
const {PhysicalMachine, MachineStates} = require('../../server/routes/models/PhysicalMachine');
const {IpAddress, IpStates} = require('../../server/routes/models/IpAddress');
const {Instance, InstanceStates} = require('../../server/routes/models/Instance');

// getAndProcess();
queue.getQueueUrl('5cd09c7f8ce33909f2f9a4a2').then(r => console.log('good '+r)).catch(r => console.log('bad '+r));

function getAndProcess() {
  queue.receiveMessage().then(async data => {
    if (data.Messages == undefined) {
      console.log("No messages to process...");
      setTimeout(getAndProcess, 3000);
    }
    else {
      data = data.Messages;
      let receiptHandle = data[0].ReceiptHandle;
      let instance = data[0].Body;
      let attributes = data[0].MessageAttributes;

      let physicalMachine = await getPhysicalMachine(instance.freeCores, instance.freeRam, instance.freeMemory);
      let ipAddress = await getIpAddress();
      await updateInstance(instance['_id'], physicalMachine, ipAddress);



      await queue.deleteMessage(receiptHandle);
      setTimeout(getAndProcess, 1000);
    }
  }).catch(error => {
    console.log("Error getting messages out of the queue");
    setTimeout(getAndProcess, 3000);
    console.log(error)
  })
}

async function updateInstance(instanceId, physicalMachine, ipAddress){
  let instance = await Instance.findById(instanceId);
  if (instance == undefined){
    throw new Error({message:'Something went horribly wrong, no instance.'});
  }

  instance.ipAddressId = ipAddress['_id'];
  instance.physicalMachineId = physicalMachine['_id'];
  instance.state = InstanceStates.RESOURCES_ASSIGNED;
  instance.save();

  return instance;
}

async function getPhysicalMachine(cores, ram, memory){
  let physicalMachine = await PhysicalMachine.findOne({
    freeCores: { $gt: cores },
    freeRam: { $gt: ram },
    freeMemory: { $gt: memory },
    state: MachineStates.RUNNING
  });
  if (physicalMachine == undefined){
    throw new Error({message:'There are no machines available with the specified resources.'});
  }

  physicalMachine.freeCores -= cores;
  physicalMachine.freeRam -= ram;
  physicalMachine.freeMemory -= memory;
  await physicalMachine.save();

  return physicalMachine;
}

async function getIpAddress(){
  let ipAddress = await IpAddress.findOne({
    state: IpStates.UN_ASSIGNED,
  });
  if (ipAddress == undefined){
    throw new Error({message:'There are no ip addresses available.'});
  }

  ipAddress.state = IpStates.ASSIGNED;
  await ipAddress.save();

  return physicalMachine;
}