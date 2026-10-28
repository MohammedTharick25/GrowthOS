import{DailyPlan}from'../dailyPlan/dailyPlan.model.js';import{Checkin}from'../checkin/checkin.model.js';import{Habit}from'../habit/habit.model.js';import{Review}from'../review/review.model.js';import{StudySession}from'../studySession/studySession.model.js';import{CourageMoment}from'../courageMoment/courageMoment.model.js';import{FinanceEntry}from'../finance/finance.model.js';
export const analyticsRepository={
  async range(userId,from,to){const[plans,checkins,habits,reviews,study,moments,finance]=await Promise.all([
    DailyPlan.find({userId,dateKey:{$gte:from,$lte:to}}).select('dateKey priorities').lean(),
    Checkin.find({userId,dateKey:{$gte:from,$lte:to}}).populate({path:'habitId',select:'identityKey title'}).lean(),
    Habit.find({userId,isDeleted:false,isArchived:false}).select('identityKey schedule').lean(),
    Review.find({userId,type:'daily',dateKey:{$gte:from,$lte:to}}).select('dateKey mood energy').lean(),
    StudySession.find({userId,isDeleted:false,dateKey:{$gte:from,$lte:to}}).select('dateKey minutes').lean(),
    CourageMoment.find({userId,isDeleted:false,dateKey:{$gte:from,$lte:to}}).select('dateKey kind').lean(),
    FinanceEntry.find({userId,isDeleted:false,dateKey:{$gte:from,$lte:to}}).select('dateKey type amount').lean(),
  ]);return{plans,checkins,habits,reviews,study,moments,finance};},
};
