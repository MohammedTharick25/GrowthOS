import{Journey}from'./journey.model.js';
export const journeyRepository={get:(userId)=>Journey.findOne({userId}),create:(data)=>Journey.create(data),save:(userId,updates)=>Journey.findOneAndUpdate({userId},{$set:updates},{new:true,runValidators:true}),};
