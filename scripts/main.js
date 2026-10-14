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
// Regex search, sorting and highlights
function compile_search(query){
    if (!query){
        return null;
    }
    try{
        const flags=casey && casey.checked? "gi" : "g";
        return new RegExp(query, flags);
    }
    catch(error){
        return false;
    }
}
function get_visible_activities(){
    let visible=[...activities];
    const query=find? find.value.trim(): "";
    search_pattern=compile_search(query);
    if(search_pattern === false){
        show_message("search-message", "Invalid regular expression, please correct your search!");
         return null;
    }
   if(search_pattern){
    visible=visible.filter(function(item){
        search_pattern.lastIndex=0;
        return search_pattern.test(item.title + " " + item.tag);
    });
    show_message("search-message", visible.length + "matching activities found.");
   }
   else{
    show_message("search-message", "");
   }
   const sort_by=sorta? sorta.value : "dueDate";
   visible.sort(function(a,b){
    let result=0;
    if(sort_by === "title"){
        result= a.title.localeCompare(b.title);
    }
    else if(sort_by ==="duration"){
        result= a.duration - b.duration;
    }
    else{
        result= a.dueDate.localeCompare(b.dueDate);
    }
    return sort_asc? result:-result;
   });
   return visible;
}
function add_highlight(parent, text, query){
    if(!query){
        parent.textContent= text;
        return ;
    }
    const pattern= compile_search(query);
    if(!pattern){
        parent.textContent= text;
        return;
    }
    let last_index=0;
    let match;
    while((match=pattern.exec(text)) !==null){
        parent.appendChild( document.createTextNode(text.slice(last_index, match.index)));
        const mark=document.createElement("mark");
        mark.textContent=match[0];
        parent.appendChild(mark);
        last_index=match.index + match[0].length;
        if(match[0].length ===0){
            pattern.lastIndex++;
        }
    }
    parent.appendChild(document.createTextNode(text.slice(lsat_index)));
}
// Rendering activities, edit and delete buttons
function renderActivities(){
    if(!listy){
        return;
    }
    listy.replaceChildren();
    const visible=get_visible_activities();
    if(visible ===null){
        listy.textContent="To view results, correct the search pattern.";
        updateDashboard();
        return;
    }
    if(visible.length ==0){
        listy.textContent=activities.length ===0? "No activities yet. Add your first acticity." : "No activities match your search!";
        updateDashboard();
        return;
    }
    const query=find? find.value.trim():"";
    visible.forEach(function(item){
        const card=document.createElement("article");
        card.className="activity-card";
        const heading=document.createElement("h3");
        add_highlight(heading, item.title, query);
        const date=document.createElement("p");
        date.textContent="Due date:" + item.dueDate;
        const duration=document.createElement("p");
        duration.textContent="Duration:" + format_duration(item.duartion);
        const tag= document.createElement("p");
        tag.textContent="Tag:" + item.tag;
        const edit_button=document.createElement("button");
        edit_button.type="button";
        edit_button.textContent="Edit";
        edit_button.setAttribute("aria-label", "Edit activity:" + item.title);
        edit_button.addEventListener("click", function(){
            editActivity(item.id);
        });
        const delete_button=document.createElement("button");
        delete_button.type="button";
        delete_button.textContent="Delete";
        delete_button.setAttribute("aria-label", "Delete activity:" + item.title);
        delete_button.addEventListener("click", function(){
            deleteActivity(item.id);
        });
        card.append(heading, date, duration, tag, edit_button, delete_button);
        listy.appendChild(card);
    });
    updateDashboard();
}
// Adding, editing and deleting activities
function resetActivityForm(){
    if(activity){
        activity.reset();
    }
    editingId=null;
    const id_field=document.getElementById("activity-id");
    if (id_field){
        id_field.value="";
    }
    show_message("form-heading", "Add an activity");
    show_message("save-button", "Add activity");
}
function editActivity(id){
    const item= activities.find(function(entry){
        return entry.id ===id;
    });
    if(!item || !activity){
        return;
    }
    editingId= id;
    document.getElementById("title").value= item.title;
    document.getElementById("due-date").value= item.dueDate;
    document.getElementById("duartion").value= item.duration;
    document.getElementById("tag").value= item.tag;
    const id_field= document.getElementById("activity-id");
    if (id_field){
        id_field.value= id;
    }
    show_message("form-geading", "Edit an activity");
    show_message("save-button", "Save changes");
    document.getElementById("title").focus();
}
function deleteActivity(id){
    const item= activities.find(function(entry){
        return entry=== id;
    });
    if(!item || window.confirm("Delete" + item.tilte + "?")){
        return;
    }
    const previous=activities;
    activities= activities.filter(function(entry){
        return entry.id !== id;
    });
    if(!save_activities()){
        activities=previous;
        return;
    }
    if (editingId === id){
        resetActivityForm();
    }
    show_message("form-message", "Activity deleted successfully!");
    renderActivities();
}
if (activity){
    activity.addEventListener("submit", function(event){
        event.preventDefault();
        const title= get_value("title");
        const date= get_value("due-date");
        const duration= get_value("duration");
        const tag= get_value("tag");
        const error = validate(title, date, duration, tag);
        if(error){
            show_message("form-message", error);
            return;
        }
        const item={
            id: editingId ||(Date.now().toString + Math.random().toString(16).slice(2)), title: title, dueDate: date, duration: Number(duration), tag: tag};
            if (exceeds_weekly_cap(item)){
                show_message("form-message", "The activity exceeds your weekly cap.");
                return;
            }
            const previous=[...activities];
            if(editingId){
                activities= activities.map(function(old_item){
                    return old_item.id === editingId ? item: old_item;
                });
            }
            else{
                activities.push(item);
            }
            if(!save_activities()){
                activities= previous;
                return;
            }
            resetActivityForm();
            show_message("form-message", "Activity saved successfylly saved!");
        });
    }
    // Weekly target and cap
    function get_week_start(date){
        const start= new Date( date.getFullYear(), date.getMonth(), date.getDate());
        const days_since_monday=(start.getDay() +6)%7;
        start.setDate(start.getDate() - days_since_monday);
        start.setHours(0, 0, 0, 0);
        return start;
    }
    function updateDashboard(){
        const total_duration= activities.reduce(function(total, item){
            return total + item.duration;
        }, 0);
        const tag_counts={};
        activities.forEach(function(item){
            tag_counts[item.tag]= (tag_counts[item.tag] || 0) +1;     
        });
        let top_tag="None yet";
        let highest_count=0;
        Object.keys(tag_counts).forEach(function(tag){
            if (tag_counts[tag] > highest_count){
                top_tag= tag;
                highest_count = tag_counts[tag];
            }
        });
        const week_start= get_week_start(new Date());
        const next_week= new Date(week_start);
        next_week.setDate(next_week.getDate() +7);
        const week_total= activities.reduce(function(total, item){
            const due_date= new Date(item.dueDate + "T00:00:00");
            return due_date >= week_start && due_date < next_week ? + item.duration : total;
        },0);
        show_message ("top-tag", top_tag);
        show_message("week_total", format_duration(week_total));
        const cap= Number(settings.cap);
        let status = "You are within your weekly target. Good work!";
        if (week_total > cap){
            status= "warning!! Your weekly cap has been exceeded.";
        }
        else if(week_total > target_minutes){
            status= "Your weekly target has been exceeded.";
        }
        show_message("message", status);
        const chart= document.getElementById("weekly-chart");
        if (chart){
            const percent= Math.min(100, (week_total/ target_minutes)*100);
            chart.style.width= percent + "%";
            chart.setAttribute("role", "progress bar");
            chart.setAttribute("aria-valuemin", "0");
            chart.setAttribute("aria-valuemax", "100");
            chart.setAttribute("aria-valuenow", String(Math.round(percent)));
            chart.setAttribute("aria-label", "Weekly planned minutes compared with target");
        }
        const target_input = document.getElementById("target");
        if(target_input && document.activeElement !== target_input){
            target_input.value= String(target_minutes);
        }
        const sap_input= document.getElementById("weekly0cap");
        if(cap_input && document.activeElement !== cap_input){
            cap_input.value= String(settings.cap);
        }

    }
    function exceeds_weekly_cap(item){
        const start= get_week_start( new Date());
        const end= new Date(start);
        end.setDate(end.getDate() +7);
        const due_date = new Date(item.dueDate + "T00:00:00");
        if(due_date < start || due_date >= end){
            return false;
        }
        const current_total = activities.reduce(function(total, old_item){
            const old_date = new Date(old_item.dueDate + "T00:00:00");
            if(old_item.id !== editingId && old_date >= start && old_date < end){
                return total + old_item.duration;
            }
            return total;
        },0);
        return current_total + item.duration > Number(settings.cap);
    }

