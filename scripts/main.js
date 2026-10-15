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
// Navigation betwwen application views
const navigation_links= document.querySelectorAll("nav a");
const app_views= document.querySelectorAll(".app-view");
function show_view(view_id){
    app_views.forEach(function(view){
        view.classList.remove("is-active");
    });
    const selected_view = document.getElementById(view_id);
    if(selected_view){
        selected_view.classList.add("is-active");
    }
    if(view_id === "activities"){
        document.getElementById("form-section").classList.add("is-active");
    }
    navigation_links.forEach(function(link){
        const is_current = link.getAttribute("href") === "#" + view_id;
        if(is_current){
            link.setAttribute("aria-current", "page");
        }
        else{
            link.removeAttribute("aria-current");
        }
    });
}
navigation_links.forEach(function(link){
    link.addEventListener("click", function(event){
        const view_id = link.getAttribute("href").slice(1);
        if(document.getElementById(view_id)){
            event.preventDefault();
            show_view(view_id);
            history.replaceState(null, "", "#" + view_id);
            window.scrollTo(0, 0);
        }
    });
});
const initial_view = window.location.hash.slice(1);
const valid_views = ["dashboard", "activities", "settings", "about"];
show_view(valid_views.includes(initial_view) ? initial_view : "dashboard");
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
         }).map(function(item){
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
        if(!saved_data || 
            typeof saved_data !== "object" ||
        Array.isArray(saved_data)){
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
        return "Duration must be a whole number between 5 and 720 minutes";
    }
    const tag_pattern= /^[a-zA-Z][a-zA-Z -]{0,29}$/;
    if (!tag_pattern.test(tag)){
        return "The tag can only contain 1-29 letters, hyphens, or spaces.";
    }
    return "";
}
function format_duration(minutes){
    if(settings.unit === "hours"){
        return(minutes / 60).toFixed(2) + " hours";
    }
    const hours = Math.floor(minutes / 60);
    const remainder= minutes % 60;
    if (hours === 0){
        return `${minutes} min`;
    }
    if (remainder === 0){
        return `${hours} hr`;
    }
    return `${hours} hr ${remainder} min`;

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
    show_message("search-message", visible.length + " matching activities found.");
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
        mark.textContent = match[0];
        parent.appendChild(mark);
        last_index=match.index + match[0].length;
        if(match[0].length ===0){
            pattern.lastIndex++;
        }
    }
    parent.appendChild(document.createTextNode(text.slice(last_index)));
}
// Rendering activities, edit and delete buttons
function renderActivities(){
    if(!listy){
        return;
    }
    listy.replaceChildren();
    const visible=get_visible_activities();
    if(visible ===null){
        listy.textContent = "To view results, correct the search pattern.";
        updateDashboard();
        return;
    }
    if(visible.length ==0){
        listy.textContent=activities.length ===0? "No activities yet. Add your first activity." : "No activities match your search!";
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
        date.textContent = "Due date: " + item.dueDate;
        const duration=document.createElement("p");
        duration.textContent = "Duration: " + format_duration(item.duration);
        const tag= document.createElement("p");
        tag.textContent = "Tag: " + item.tag;
        const edit_button=document.createElement("button");
        edit_button.type="button";
        edit_button.textContent="Edit";
        edit_button.setAttribute("aria-label", "Edit activity: " + item.title);
        edit_button.addEventListener("click", function(){
            editActivity(item.id);
        });
        const delete_button=document.createElement("button");
        delete_button.type="button";
        delete_button.textContent="Delete";
        delete_button.setAttribute("aria-label", "Delete activity: " + item.title);
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
    document.getElementById("duration").value= item.duration;
    document.getElementById("tag").value= item.tag;
    const id_field= document.getElementById("activity-id");
    if (id_field){
        id_field.value= id;
    }
    show_message("form-heading", "Edit an activity");
    show_message("save-button", "Save changes");
    document.getElementById("title").focus();
}
function deleteActivity(id){
    const item= activities.find(function(entry){
        return entry.id === id;
    });
    if (!item){
        return;
    } 
    if (!window.confirm("Delete " + item.title + "?")){
        return;
    }
    const previous=activities;
    activities= activities.filter(function(entry){
        return entry.id !== id;
    });
    if (!save_activities()){
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
            id: editingId ||(Date.now().toString() + Math.random().toString(16).slice(2)), title: title, dueDate: date, duration: Number(duration), tag: tag};
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
            show_message("form-message", "Activity saved successfully!");
            renderActivities();
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
        const totalActivitiesElement = document.getElementById("total-activities");
        const totalDurationElement = document.getElementById("total-duration");
        if(totalActivitiesElement){
            totalActivitiesElement.textContent = activities.length;
        }
        if(totalDurationElement){
            totalDurationElement.textContent = format_duration(total_duration);
        }
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
            return due_date >= week_start && due_date < next_week ? total + item.duration : total;
        },0);
        show_message ("top-tag", top_tag);
        show_message("week-total", format_duration(week_total));
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
        const chartBar= document.getElementById("weekly-chart-bar");
        if (chart && chartBar){
            const percent = Math.min(100, (week_total / target_minutes) * 100);
            chartBar.style.width= percent + "%";
            chart.setAttribute("role", "progressbar");
            chart.setAttribute("aria-valuemin", "0");
            chart.setAttribute("aria-valuemax", "100");
            chart.setAttribute("aria-valuenow", String(Math.round(percent)));
            chart.setAttribute("aria-label", "Weekly planned minutes compared with target");
        }
        const target_input = document.getElementById("target");
        if(target_input && document.activeElement !== target_input){
            target_input.value= String(target_minutes);
        }
        const cap_input= document.getElementById("weekly-cap");
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
const save_target_button= document.getElementById("save-target");
if (save_target_button){
    save_target_button.addEventListener("click", function(){
        const new_target = Number(get_value("target"));
        const cap_field = document.getElementById("weekly-cap");
        const new_cap = cap_field ? Number(cap_field.value): Number(settings.cap);
        if(!Number.isInteger(new_cap) || new_cap < 1 || new_cap>1000){
            show_message("cap-error", "Weekly cap must be a positive number between 1 and 1000.");
            return;
        }
        show_message("cap-error", "");
        if(!Number.isInteger(new_target)|| new_target < 1 || new_target > 10080){
            show_message("result", "Weekly target must be from 1 to 10080 minutes.");
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
            show_message("result", "Duration display preferences saved.");
        }
    });
}
    const convert_button = document.getElementById("convert");
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
            const export_data ={ application: "Campus Life Planner", version: 1, activities: activities};
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
                const previous = [...activities];
                const new_items= imported_items.map(function(item){
                    return{
                        id: Date.now().toString() + Math.random().toString(16).slice(2),
                        title: item.title.trim(),
                        dueDate: item.dueDate,
                        duration: Number(item.duration),
                        tag: item.tag.trim()
                    };
                });
                activities = [...activities, ...new_items]
                if(!save_activities()){
                    activities = previous;
                    renderActivities();
                    return;
                }
                resetActivityForm();
                renderActivities();
                import_file.value ="";
                show_message("import-message", new_items.length + " activities imported successfully.");
            }
            catch(error){
                show_message("import-message", "Failed to import: " + error.message);
            }
        });
    }
    //Accessibility audit
    if(find){
        find.addEventListener("input", renderActivities);
    }
    if(casey){
        casey.addEventListener("change", renderActivities);
    }
    if(sorta){
        sorta.addEventListener("change", renderActivities);
    }
    if(ordie){
        ordie.textContent = "Sort: Ascending";
        ordie.addEventListener("click", function(){
            sort_asc =!sort_asc;
            ordie.textContent= sort_asc ? "Sort: Ascending" : "Sort: Descending";
            renderActivities();
        });
    }
    renderActivities();


