import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 property:{type:mongoose.Schema.Types.ObjectId,ref:'Property',required:true},
 customer:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 rating:{type:Number,min:1,max:5,required:true},comment:{type:String,maxlength:1000}
},{timestamps:true});
schema.index({property:1,customer:1},{unique:true});
export default mongoose.model('Review',schema);
