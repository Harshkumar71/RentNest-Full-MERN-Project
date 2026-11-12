import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,required:true},
 type:{type:String,enum:['Apartment','House','Villa','Room','Farmhouse'],default:'Apartment'},
 pricePerNight:{type:Number,required:true,min:0},
 location:{address:String,city:{type:String,index:true},state:String,country:{type:String,default:'India'},lat:Number,lng:Number},
 bedrooms:{type:Number,default:1},bathrooms:{type:Number,default:1},maxGuests:{type:Number,default:2},
 amenities:[String],images:[String],
 averageRating:{type:Number,default:0},ratingCount:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{timestamps:true});
export default mongoose.model('Property',schema);
