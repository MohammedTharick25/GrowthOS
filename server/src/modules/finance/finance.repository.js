import{FinanceEntry}from'./finance.model.js';
export const financeRepository={
  create:(data)=>FinanceEntry.create(data),
  range:(userId,from,to)=>FinanceEntry.find({userId,dateKey:{$gte:from,$lte:to},isDeleted:false}).sort({dateKey:-1,createdAt:-1}).lean(),
  update:(userId,id,updates)=>FinanceEntry.findOneAndUpdate({_id:id,userId,isDeleted:false},{$set:updates},{new:true,runValidators:true}),
  remove:(userId,id)=>FinanceEntry.findOneAndUpdate({_id:id,userId,isDeleted:false},{$set:{isDeleted:true,deletedAt:new Date()}},{new:true}),
};
