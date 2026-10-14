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
// Loading and saving activities to local storage
function load_activities(){
    try{
        const saved_data= localStorage.getItem(storage_key);
        if(!saved_data){
            return [];
        }
        const parsed_data= JSON.parse(saved_data);
        if(!Array.isArray(parsed_data)){
            return[];
        }
        return parsed_data.filter(function(item){
            return item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.dueDate === "string" &&
            Number.isInteger(Number(item.duration)) &&
            typeof item.tag === "string";
        });
        map(function(item){
            return{
                id: item.id,
                title: item.title,
                dueDate: item.dueDate,
                duration: Number(item.duration),
                tag: item.tag
            };

        });
    }
    catch (error){
        console.error("Can't load activities:", error);
    return [];
    }
}
function save_activities(){
    try{
        localStorage.setItem(storage_key, JSON.stringify(activities));
        return true;
    }
    catch(error){
        show_message("form-message", "Failed to save activities. Check your browser storage.");
        return false;
    }
}
function loadTarget(){
    try{
        const saved_data= Number(localStorage.getItem(target_key));
        return Number.isInteger(saved_data) && saved_data > 0 && saved_data <= 10080 ? saved_data : 600;
    }
    catch(error){
        return 600;
    }
}
function loadSettings(){
    const defaults= {unit: "minutes", cap:1000};
    try{
        const saved_data= JSON.parse(localStorage.getItem(settings_key));
        if(!saved_data || typeof saved_data !== "object"){
            return defaults;
        }
        return{
            unit: saved_data.unit === "hours" ? "hours" : "minutes",
            cap: Number.isFinite(Number(saved_data.cap)) && Number(saved_data.cap)> 0 ? Number(saved_data.cap): defaults.cap
        };
    }
    catch(error){
        return defaults;
    }
}
function saveTarget(){
    try{
        localStorage.setItem(target_key, String(target_minutes));
        return true;
    }
    catch(error){
        show_message("result", "Could not save the weekly target.");
        return false;
    }
}
function saveSettings(){
    try{
        localStorage.setItem(settings_key, JSON.stringify(settings));
        return true;
    }
    catch(error){
        show_message("result", "Could not save your settings.");
        return false;
    }
}
function get_value(id){
    const element =document.getElementById(id);
    return element ? element.value.trim() : "";
}
function show_message(id, message){
    const element= document.getElementById(id);
    if(element){
        element.textContent = message;
    }
}
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
// Settings and duration units
function format_duration(minutes){
    if(settings.unit === "hours"){
        const hours = (minutes / 60).toFixed(2);
        return hours + "hours";
    }
    return minutes + "minutes";
}
const save_target_button= document.getElementById("save-target");
if (save_target_button){
    save_target_button.addEventListener("click", function(){
        const new_target = Number(get_value("target"));
        const cap_field = document.getElementById("weekly-cap");
        const new_cap = cap_field ? Number(cap_field.value): Number(settings.cap);
        if(!Number.isInteger(new_target)|| new_target < 1 || new_target > 10080){
            show_message("resulst", "Weekly target must be from 1 to 10080 minutes.");
            return;
        }
        const old_target = target_minutes;
        const old_cap = settings.cap;
        target_minutes = new_target;
        settings.cap = new_cap;
        if (!saveTarget() || !saveSettings()){
            target_minutes = old_target;
            settings.cap = old_cap;
            return;
        }
        show_message("result", "Weekly target and cap saved successfully.");
        updateDashboard();
    });
}
const unit_select = document.getElementById("duration-unit");
if(unit_select){
    unit_select.value = settings.unit;
    unit_select.addEventListener("change", function(){
        settings.unit = unit_select.value === "hours"? "hours" : "minutes";
        if(saveSettings()){
            renderActivities();
            show_message("result", "Duration display prefereces saved.");
        }
    });
    if (convert_button){
        convert_button.addEventListener("click", function(){
            const raw_minutes = get_value("minutes");
            const minutes = Number(raw_minutes);
            if(raw_minutes === ""|| !Number.isFinite(minutes)|| minutes <0){
                show_message("result", "Enter a valid number of minutes");
                return;
            }
            show_message("result", format_duration(minutes));
        });
    }
    const export_button = document.getElementById("export");
    if(export_button){
        export_button.addEventListener("click", function(){
            const export_data ={ apllication: "Campus Life Planner", version:1, activities: activities};
            const file= new Blob([JSON.stringify(export_data, null, 2)],{type: "application/json"});
            const file_url = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = file_url;
            link.download= "campus-life-planner.json";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(file_url);
            show_message("import-message", "Activities exported successfully!");
        });
    }
    const import_button = document.getElementById("import");
    const import_file = document.getElementById("import-file");
    function validate_imported_activity(item){
        if(!item || typeof item.title !== "string"|| typeof item.dueDate !== "string"|| typeof item.tag !== "string"){
            return false;
        }
        return validate(item.title, item.dueDate, String(item.duration), item.tag) === "";
    }
    if(import_button && import_file){
        import_button.addEventListener("click", async function(){
            const file = import_file.files[0];
            if(!file){
                show_message("import-message", "Choose a JSON file first.");
                return;
            }
            try{
                const file_text = await file.text();
                const parsed_data= JSON.parse(file_text);
                const imported_items = Array.isArray(parsed_data) ? parsed_data : parsed_data && parsed_data.activities;
                if(!Array.isArray(imported_items) || imported_items.length > 1000){
                    throw new Error("The file must not exceed 1000 records!");
                }
                if (!imported_items.every(validate_imported_activity)){
                    throw new Error("Failed to import! The file contains invalid activities.");
                }
                const previous = activities;
                activities = imported_items.map(function(item){
                    return{
                        id: Date.now().toString() + Math.random().toString(16).slice(2),
                        title: item.title.trim(),
                        dueDate: item.dueDate,
                        duration: Number(item.duartion),
                        tag: item.tag.trim()
                    };
                });
                if(!save_activities()){
                    activities = previous;
                    renderActivities();
                    return;
                }
                resetActivityForm();
                renderActivities();
                import_file.value ="";
                show_message("import-message", activities.length + "activities imported successfully.");
            }
            catch(error){
                show_message("import-message", "Failed to import: " + error.message);
            }
        });
    }
}

