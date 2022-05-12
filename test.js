const date = new Date(0);

const someTime = Date.parse("August 18, 1998");
const UpToToday = date.getTime()-someTime;

const days = UpToToday/86400000;
const years = days/365.25;
//const Uptodate = new Date(UpToToday);

console.log(date);
console.log(years);