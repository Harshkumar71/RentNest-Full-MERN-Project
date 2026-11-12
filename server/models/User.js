import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 email:{type:String,required:true,unique:true,lowercase:true},
 password:{type:String,required:true},
 role:{type:String,enum:['customer','owner','admin'],default:'customer'},
 avatar:String,phone:String
},{timestamps:true});
export default mongoose.model('User',schema);
