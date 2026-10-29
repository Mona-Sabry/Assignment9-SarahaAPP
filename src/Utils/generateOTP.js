export function generateOTP(){
  return Math.floor(Math.random() * (800000 + 100000) + 100000);
};