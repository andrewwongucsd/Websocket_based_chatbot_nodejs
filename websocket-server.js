var doctors_list = {};

module.exports = function startServer(io) {
  var numUsers = 0;
  var numDr = 0;
  var numPa = 0;

  io.on('connection', function (socket) {
    var addedUser = false;
    console.log('connection');
    socket.emit('peek', {
      numUsers: numUsers,
      numDr: numDr,
      numPa: numPa
    });

    socket.on('for doctors', function (data){
      console.log('for doctors b/e');
      console.log(data);
      // socket.emit('for doctors', {
      //     action: 'ask doctors',
        // username_to: username,
        // usertype_to: usertype,
        // username_from: data.username,
        // usertype_from: data.usertype,
        // message: data.message
      // })
      if(socket.usertype == 'doctor'){
        if(data.action == 'ask doctors'){
          var message = "";
          if(data.message.toLowerCase().indexOf('headache') >= 0){
            console.log("in headache");
            message = "Have you taken mid-term exam?"
          }else if(data.message.toLowerCase().indexOf('exercising') >= 0){
            console.log("in exercising");
            message = "Do you want me to setup General Checkup"
          }else if(data.message.toLowerCase().indexOf('drossy') >= 0){
            console.log("in drossy");
            message = "Do you feel flu symptoms - like Cold & Fever?"
          }else if(data.message.toLowerCase().indexOf('stressed') >= 0){
            console.log("in stressed");
              message = "are you taking any summer interships?"
          }else if(data.message.toLowerCase().indexOf('lonely') >= 0){
            console.log("in lonely");
            message = "Are you techie?"
          }
          if(message != ""){
            socket.broadcast.emit('for patient',{
              action: data.action,
              username_from: socket.username,
              usertype_from: socket.usertype,
              username_to: data.username_to,
              usertype_to: data.usertype_to,
              message: message
            });
            socket.emit('for patient',{
              action: data.action,
              username_from: socket.username,
              usertype_from: socket.usertype,
              username_to: data.username_to,
              usertype_to: data.usertype_to,
              message: message
            });
          }

        }
      }

    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
      console.log('new message');

      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        usertype: socket.usertype,
        message: data
      });
    });

    socket.on('for patient', function(data){
      console.log('for patient b/e at '+socket.username);
      console.log(data);
      if(socket.usertype == 'doctor'){
        if(data.action == 'add user' && data.username_from == socket.username){
          socket.broadcast.emit('for patient',{
            action: "add user",
            username_from: data.username_from,
            usertype_from: data.usertype_from,
            username_to: data.username_to,
            usertype_to: data.usertype_to,
            message: "Hi "+data.username_to+", I am here to help you."
          });
        }
      }
    })
    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (json) {
      console.log('add user');

      if (addedUser) return;
      // we store the username in the socket session for this client
      socket.username = json.username;
      socket.usertype = json.usertype;
      ++numUsers;
      if(socket.usertype == "doctor"){
        ++numDr;
      }else{
        if(numDr > 0){
          // notify doctors
          console.log('for doctor in patient b/e');
          socket.broadcast.emit('for doctors',{
            action: "add user",
            username: socket.username,
            usertype: socket.usertype,
            message: ""
          });
        }
        ++numPa;
      }
      addedUser = true;
      socket.emit('login', {
        numUsers: numUsers,
        numDr: numDr,
        numPa: numPa,
        username: socket.username
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        usertype: socket.usertype,
        numDr: numDr,
        numPa: numPa,
        numUsers: numUsers
      });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      console.log('discount');

      if (addedUser) {
        --numUsers;
        if(socket.usertype == "doctor"){
          --numDr;
        }else{
          --numPa;
        }

        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          usertype: socket.usertype,
          numUsers: numUsers
        });
      }
    });
  });
}
