const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(8000).sockets;


//Connect Mongo

mongo.connect('mongodb://127.0.0.1/mongochat',  {useUnifiedTopology: true},(err, db)=>{
    if(err){
        throw err;
    }
    console.log('MongoDB connected');
    // Connect to Socket.Io
    
    client.on('connection', (socket)=>{
        let chat = db.collection('chats');

        //Create fucntion to send status
        sendStatus = (s)=>{
            socket.emit('status', s)
        }

        //Get Chat from collection
        chat.find().limit(100).sort({_id: 1}).toArray((err, res)=>{
            if(err){
                throw err;
            
            }
            //emit msg
            socket.emit('output', res);
        });

        //Handle Input
        socket.on('input', (data)=>{
            let name = data.name;
            let message = data.message;

            //Validation
            if(name == '' || message == ''){
                //send Er status
                sendStatus('please enter a name and msg');
            } else {
                //insert Msg
                chat.insert({name: name, message: message},()=>{
                    client.emit('output', [data]);

                    //send status obj
                    sendStatus({
                        message: 'message sent',
                        clear: true
                    });
                });
            }
        });

        //Handle Clear
        socket.on('clear', (data)=>{
            //Remove all chats
            chat.remove({}, ()=>{
                //Emit cleared
                socket.emit('cleared');
            });
        });






    });
   
});