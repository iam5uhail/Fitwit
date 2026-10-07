const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://suhailk241_db_user:J2CO26OXRSE2iTm4@ac-xtmywb9-shard-00-00.kmrq1if.mongodb.net:27017,ac-xtmywb9-shard-00-01.kmrq1if.mongodb.net:27017,ac-xtmywb9-shard-00-02.kmrq1if.mongodb.net:27017/fitwit?ssl=true&replicaSet=atlas-q4lpo6-shard-0&authSource=admin&appName=Cluster0';

const dailyStepSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true },
  steps: { type: Number, default: 0 },
  goal: { type: Number, default: 8000 }
});
const DailyStep = mongoose.model('DailyStep', dailyStepSchema);

const email = 'suhailk241@gmail.com';

function generateMonth(year, month, daysInMonth, totalTarget, activeDay, activeSteps, leisureDay, leisureSteps, goalDaysStr) {
  let days = [];
  const goalDaysArr = goalDaysStr.split(',').map(Number);
  
  // Set the specific days
  days[activeDay] = activeSteps;
  days[leisureDay] = leisureSteps;
  
  // Give all goal days 8000 steps minimum (except leisure/active if they overlap)
  for(let i=1; i<=daysInMonth; i++) {
     if(i === activeDay || i === leisureDay) continue;
     if(goalDaysArr.includes(i)) {
         days[i] = 8000;
     } else {
         days[i] = 500; // Base non-goal day
     }
  }

  let currentTotal = days.reduce((a, b) => (a || 0) + (b || 0), 0);
  let diff = totalTarget - currentTotal;
  
  // Distribute the remaining difference evenly among non-specific days
  let availableDays = [];
  for(let i=1; i<=daysInMonth; i++) {
     if(i !== activeDay && i !== leisureDay) availableDays.push(i);
  }
  
  let perDayAdd = Math.floor(diff / availableDays.length);
  for(let day of availableDays) {
     days[day] += perDayAdd;
  }
  
  // Fix the remainder on the first available day
  let newTotal = days.reduce((a, b) => (a || 0) + (b || 0), 0);
  let remainder = totalTarget - newTotal;
  days[availableDays[0]] += remainder;

  const records = [];
  for(let i=1; i<=daysInMonth; i++) {
     let dateStr = `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
     records.push({
         email,
         date: dateStr,
         steps: days[i],
         goal: goalDaysArr.includes(i) ? 8000 : 12000
     });
  }
  return records;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB. Clearing old steps for', email);
  await DailyStep.deleteMany({ email });

  console.log('Generating exact data from screenshots without freezing...');
  const aug = generateMonth(2024, 8, 31, 71663, 14, 7324, 29, 415, '9,10,11,12,13,14,15,16,18,19,20,21,22,23,24,25,26,27,28,29,30,31');
  const sept = generateMonth(2024, 9, 30, 72057, 29, 5469, 26, 345, '2,23,25,29,30');
  const oct = generateMonth(2024, 10, 31, 6666, 1, 3081, 3, 1107, '1,2,3');

  const allRecords = [...aug, ...sept, ...oct];
  
  await DailyStep.insertMany(allRecords);
  console.log(`✅ Successfully seeded ${allRecords.length} exact days of step history into MongoDB!`);
  process.exit(0);
}

seed();
