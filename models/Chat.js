import mongoose from "mongoose";


const  chatSchema = new mongoose.Schema(
    {

        name :{type:String, require:true},
        messages:[
            {
           role :{type:String, require:true},
           content :{type:String, require:true},
           timestamps :{type:Number, require:true},
        },

    ],
    userId:{type:String, require:true},

    },
    {timestamps:true}
);

const Chat =mongoose.models.Chat || mongoose.model("Chat",chatSchema)

export default Chat;