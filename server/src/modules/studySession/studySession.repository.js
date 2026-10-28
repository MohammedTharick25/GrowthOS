import{StudySession}from'./studySession.model.js';
export const studySessionRepository={create:(data)=>StudySession.create(data),range:(userId,from,to)=>StudySession.find({userId,dateKey:{$gte:from,$lte:to},isDeleted:false}).sort({dateKey:1}).lean(),remove:(userId,id)=>StudySession.findOneAndUpdate({_id:id,userId,isDeleted:false},{isDeleted:true,deletedAt:new Date()},{new:true})};
