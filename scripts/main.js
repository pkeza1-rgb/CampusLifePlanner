//Forms and regex validation
// Storage keys
const storage_key="CampusLifePlanner.activities";
const target_key="CampusLifePlanner.target";
const settings_key="CampusLifePlanner.settings";
// HTML elements
const activity=document.getElementById("activity-form");
const listy=document.getElementById("activity-list");
const find=document.getElementById("search");
const casey=document.getElementById("ignore-case");
const sorta=document.getElementById("sort");
const ordie=document.getElementById("sort-order");
// Main variables
let activities= load_activities();
let sort_asc=true;
let editingId=null;
let search_pattern=null;
let target_minutes=loadTarget();
let settings=loadSettings();
// Validation and advanced regex
function validate(title, date, duration, tag){
    if (
        title.length<3 || title.length>100 || title.trim()!==title
    ){
        return "Title must contain 3 to 100 characters please!";
    }
    const w_repeat= /\b(\w+)\s+\1\b/i;
    if (w_repeat.test(title)){
        return "Word repetition is not allowed in the title. Correct your title please!";
    }
    const date_pattern=/^\d{4}-\d{2}-\d{2}$/;
    const parts=date.split("-").map(Number);
    if (!date_pattern.test(date)){
        return "The date format is YYYY-MM-DD";
    }
    const checked_date=new Date(parts[0],parts[1]-1,parts[2]);
    if(checked_date.getFullYear()!==parts[0]||checked_date.getMonth()!==parts[1]-1||checked_date.getDate()!==parts[2]){
        return "Enter an existing date please!";
    }
    if(duration==""||!Number.isInteger(Number(duration))||Number(duration)<5||Number(duration)>720){
        return "Duration must be a number betwwen 5 and 720 minutes";
    }
    const tag_pattern=/^[a-zA-Z][a-zA-Z -]{1,29}$/;
    if (!tag_pattern.test(tag)){
        return "The tag can only contain 1-29 letters, hyphens, or spaces.";
    }
    return "";
}
function format_duration(minutes){
    const hours=Math.floor(minutes/60);
    const remainder=minutes%60;
    if (hours==0){
        return '${minutes} min';
    }
    if (remainder==0){
        return '${hours} hr';
    }
    return '${hours} hr ${remainder} min';

}