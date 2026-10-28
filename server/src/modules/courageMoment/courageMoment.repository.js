import{CourageMoment}from'./courageMoment.model.js';
export const courageMomentRepository={create:(data)=>CourageMoment.create(data),count:(userId)=>CourageMoment.countDocuments({userId,isDeleted:false}),range:(userId,from,to)=>CourageMoment.find({userId,dateKey:{$gte:from,$lte:to},isDeleted:false}).sort({dateKey:1}).lean()};
