const queue = require('./queue.js')

getAndProcess();

function getAndProcess() {
  try {
    queue.receiveMessage().then(data => {
      if (data == undefined) {
        console.log("No messages to process...");
        setTimeout(getAndProcess, 3000);
      } else {
        let videoId = data[0].Body;
        let attributes = data[0].MessageAttributes;
        let initialTime = new Date().getTime();
        setTimeout(getAndProcess, 1000);
      }

    }).catch(error => {
      console.log("Error getting messages out of the queue");
      setTimeout(getAndProcess, 3000);
      console.log(error)
    })
  } catch (e) {
    console.log(e);
  }
}
