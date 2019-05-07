const MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const IP_ASSIGNED = 'assigned';
const IP_UNASSIGNED = 'unassigned';

// Connection URL
const url = process.env.MONGO_URL;

// Database Name
const dbName = 'myproject';

// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true });

client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to mongo");

  const db = client.db();

  module.exports.findIpAddress  = async function () {
    const IpAddress = db.collection('ipaddresses');
    let doc = await IpAddress.findOne({
      state: IP_UNASSIGNED
    });
    if (doc == null)
      throw new Error('There are no ip addresses available.');

    return doc;
  };

  module.exports.findPhysicalMachine= async function (cores, ram, memory) {
    const PhysicalMachine = db.collection('physicalmachines');
    let doc = await PhysicalMachine.findOne({
      freeCores: {$gte: cores},
      freeRam: {$gte: ram},
      freeMemory: {$gte: memory},
      state: 'running'
    });
    if (doc == null)
      throw new Error('There are no machines available with the specified resources.');

    return doc;
  };

  module.exports.updateInstanceError  = async function (instanceId, stateMessage) {
    const Instance = db.collection('instances');
    let result = await Instance.updateOne({ '_id' : ObjectID(instanceId) }, { $set: {
      stateMessage : stateMessage.toString(),
      state: 'error-creating'
    }
    });
    return result.result;
  };

  module.exports.updateInstanceSuccess  = async function (instance) {
    const Instance = db.collection('instances');
    let result = await Instance.updateOne({ '_id' : ObjectID(instance._id) }, { $set: {
        physicalMachineId : instance.physicalMachineId,
        ipAddressId: instance.ipAddressId,
        state: 'resources-allocated',
        stateMessage : 'Ready for starting',
      }
    });
    return result.result;
  };

  module.exports.updatePhysicalMachine  = async function (id, cores, ram, memory) {
    const PhysicalMachine = db.collection('physicalmachines');
    let result = await PhysicalMachine.updateOne({ '_id' : ObjectID(id) }, { $set: {
        freeCores : cores,
        freeRam: ram,
        freeMemory: memory,
      }
    });
    return result.result;
  };

  module.exports.updateIpAddress  = async function (id) {
    const IpAddress = db.collection('ipaddresses');
    let result = await IpAddress.updateOne({ '_id' : ObjectID(id) }, { $set: {
        state: IP_ASSIGNED,
      }
    });
    return result.result;
  };
  // client.close();
});

