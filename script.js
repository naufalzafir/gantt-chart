let tasks = [];
let editingTaskId = null;

// =========================
// GET HTML ELEMENTS
// =========================

const taskForm = document.getElementById("taskForm");

const weekInput = document.getElementById("week");
const titleInput = document.getElementById("title");
const groupInput = document.getElementById("group");
const itemInput = document.getElementById("item");
const subitemInput = document.getElementById("subitem");
const personInput = document.getElementById("person");

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

const taskTableBody = document.getElementById("taskTableBody");
const ganttContainer = document.getElementById("ganttContainer");
const taskCount = document.getElementById("taskCount");

const cancelEditBtn = document.getElementById("cancelEdit");


// =========================
// FORM SUBMIT
// =========================

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    // Only check dates if both are provided
    if (startDate && endDate && endDate < startDate) {
        alert("End date cannot be earlier than start date.");
        return;
    }

    if (editingTaskId) {

        // EDIT EXISTING TASK
        const task = tasks.find(t => t.id === editingTaskId);

        if (task) {
            task.week = weekInput.value;
            task.title = titleInput.value;
            task.group = groupInput.value;
            task.item = itemInput.value;
            task.subitem = subitemInput.value;
            task.person = personInput.value;
            task.startDate = startDate;
            task.endDate = endDate;
        }

        editingTaskId = null;

        if (cancelEditBtn) {
            cancelEditBtn.style.display = "none";
        }

    } else {

        // ADD NEW TASK
        const newTask = {
            id: generateID(),
            week: weekInput.value,
            title: titleInput.value,
            group: groupInput.value,
            item: itemInput.value,
            subitem: subitemInput.value,
            person: personInput.value,
            startDate: startDate,
            endDate: endDate
        };

        tasks.push(newTask);
    }

    taskForm.reset();

    renderAll();
});


// =========================
// GENERATE ID
// =========================

function generateID() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 8);
}


// =========================
// EDIT TASK
// =========================

function editTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return;
    }

    editingTaskId = id;

    weekInput.value = task.week || "";
    titleInput.value = task.title || "";
    groupInput.value = task.group || "";
    itemInput.value = task.item || "";
    subitemInput.value = task.subitem || "";
    personInput.value = task.person || "";

    startDateInput.value = task.startDate || "";
    endDateInput.value = task.endDate || "";

    if (cancelEditBtn) {
        cancelEditBtn.style.display = "inline-block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================
// CANCEL EDIT
// =========================

if (cancelEditBtn) {

    cancelEditBtn.addEventListener("click", function () {

        editingTaskId = null;

        taskForm.reset();

        cancelEditBtn.style.display = "none";
    });

}


// =========================
// DELETE TASK
// =========================

function deleteTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return;
    }

    const taskName =
        task.title ||
        task.item ||
        task.subitem ||
        "this task";

    const confirmed = confirm(
        `Are you sure you want to delete "${taskName}"?`
    );

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(t => t.id !== id);

    if (editingTaskId === id) {
        editingTaskId = null;
        taskForm.reset();

        if (cancelEditBtn) {
            cancelEditBtn.style.display = "none";
        }
    }

    renderAll();
}


// =========================
// RENDER TASK TABLE
// =========================

function renderTaskTable() {

    taskTableBody.innerHTML = "";

    if (tasks.length === 0) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td colspan="9" style="text-align:center;">
                No tasks added yet.
            </td>
        `;

        taskTableBody.appendChild(row);

        return;
    }

    tasks.forEach(task => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(task.week)}</td>

            <td>${escapeHTML(task.title)}</td>

            <td>${escapeHTML(task.group)}</td>

            <td>${escapeHTML(task.item)}</td>

            <td>${escapeHTML(task.subitem)}</td>

            <td>${escapeHTML(task.person)}</td>

            <td>${escapeHTML(task.startDate)}</td>

            <td>${escapeHTML(task.endDate)}</td>

            <td>
                <button onclick="editTask('${task.id}')">
                    Edit
                </button>

                <button onclick="deleteTask('${task.id}')">
                    Delete
                </button>
            </td>
        `;

        taskTableBody.appendChild(row);
    });
}


// =========================
// RENDER GANTT
// =========================

function renderGantt() {

    ganttContainer.innerHTML = "";

    // Only tasks with both dates
    const datedTasks = tasks.filter(task =>
        task.startDate &&
        task.endDate
    );

    if (datedTasks.length === 0) {

        ganttContainer.innerHTML = `
            <div class="no-date-task">
                No dated tasks available for the Gantt chart.
            </div>
        `;

        return;
    }


    // =========================
    // FIND DATE RANGE
    // =========================

    let earliestDate = new Date(datedTasks[0].startDate);
    let latestDate = new Date(datedTasks[0].endDate);

    datedTasks.forEach(task => {

        const start = new Date(task.startDate);
        const end = new Date(task.endDate);

        if (start < earliestDate) {
            earliestDate = start;
        }

        if (end > latestDate) {
            latestDate = end;
        }
    });


    // =========================
    // CREATE DATE LIST
    // =========================

    const dates = [];

    let currentDate = new Date(earliestDate);

    while (currentDate <= latestDate) {

        dates.push(new Date(currentDate));

        currentDate.setDate(
            currentDate.getDate() + 1
        );
    }


    // =========================
    // GANTT WRAPPER
    // =========================

    const gantt = document.createElement("div");

    gantt.className = "gantt";


    // =========================
    // HEADER
    // =========================

    const header = document.createElement("div");

    header.className = "gantt-header";

    const headerLabel = document.createElement("div");

    headerLabel.className = "gantt-label";

    headerLabel.textContent = "Task";

    header.appendChild(headerLabel);


    const headerTimeline = document.createElement("div");

    headerTimeline.className = "gantt-timeline";

    dates.forEach(date => {

        const cell = document.createElement("div");

        cell.className = "gantt-day";

        cell.innerHTML = `
            <div>${formatDay(date)}</div>
            <small>${formatDate(date)}</small>
        `;

        headerTimeline.appendChild(cell);
    });

    header.appendChild(headerTimeline);

    gantt.appendChild(header);


    // =========================
    // TASK ROWS
    // =========================

    datedTasks.forEach(task => {

        const row = document.createElement("div");

        row.className = "gantt-row";


        // =========================
        // LABEL
        // =========================

        const label = document.createElement("div");

        label.className = "gantt-label";

        const weekText = task.week
            ? `Week ${removeWeekPrefix(task.week)}`
            : "";

        const mainText =
            task.item ||
            task.title ||
            "Untitled Task";

        const subText =
            task.subitem ||
            task.person ||
            "";


        label.innerHTML = `
            <div class="task-week">
                ${escapeHTML(weekText)}
            </div>

            <strong>
                ${escapeHTML(mainText)}
            </strong>

            ${
                subText
                    ? `<small>${escapeHTML(subText)}</small>`
                    : ""
            }
        `;

        row.appendChild(label);


        // =========================
        // TIMELINE
        // =========================

        const timeline = document.createElement("div");

        timeline.className = "gantt-timeline";


        // Create day cells

        dates.forEach(date => {

            const cell = document.createElement("div");

            cell.className = "gantt-day";

            timeline.appendChild(cell);
        });


        // =========================
        // TASK BAR
        // =========================

        const start = new Date(task.startDate);
        const end = new Date(task.endDate);


        const startIndex =
            dateDifference(
                earliestDate,
                start
            );

        const duration =
            dateDifference(
                start,
                end
            ) + 1;


        const bar = document.createElement("div");

        bar.className = "task-bar";

        bar.style.left =
            `${startIndex * 50}px`;

        bar.style.width =
            `${duration * 50 - 6}px`;

        bar.title =
            `${task.title || task.item || "Task"}\n` +
            `${task.startDate} → ${task.endDate}`;


        bar.textContent =
            task.title ||
            task.item ||
            "Task";


        timeline.appendChild(bar);

        row.appendChild(timeline);

        gantt.appendChild(row);
    });


    ganttContainer.appendChild(gantt);
}


// =========================
// DATE DIFFERENCE
// =========================

function dateDifference(date1, date2) {

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.round(
        (date2 - date1) /
        millisecondsPerDay
    );
}


// =========================
// DATE FORMATTING
// =========================

function formatDay(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );
}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            day: "2-digit",
            month: "short"
        }
    );
}


// =========================
// WEEK CLEANUP
// =========================

function removeWeekPrefix(value) {

    return String(value || "")
        .replace(/^week\s*/i, "");
}


// =========================
// ESCAPE HTML
// =========================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================
// CSV EXPORT
// =========================

function exportCSV() {

    if (tasks.length === 0) {

        alert("There are no tasks to export.");

        return;
    }


    const headers = [
        "ID",
        "Week",
        "Title",
        "Group",
        "Item",
        "Subitem",
        "Person",
        "Start Date",
        "End Date"
    ];


    const rows = tasks.map(task => [

        task.id,
        task.week,
        task.title,
        task.group,
        task.item,
        task.subitem,
        task.person,
        task.startDate,
        task.endDate

    ]);


    const csvContent = [
        headers,
        ...rows
    ]
        .map(row =>
            row
                .map(csvEscape)
                .join(",")
        )
        .join("\n");


    downloadCSV(
        csvContent,
        "gantt_tasks.csv"
    );
}


// =========================
// CSV ESCAPE
// =========================

function csvEscape(value) {

    const stringValue =
        String(value ?? "");

    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
    ) {

        return `"${stringValue.replaceAll('"', '""')}"`;
    }

    return stringValue;
}


// =========================
// DOWNLOAD CSV
// =========================

function downloadCSV(
    content,
    filename
) {

    const blob = new Blob(
        [content],
        {
            type: "text/csv;charset=utf-8;"
        }
    );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


// =========================
// SAVE AS CSV
// =========================

async function saveAsCSV() {

    if (tasks.length === 0) {

        alert("There are no tasks to save.");

        return;
    }


    const headers = [
        "ID",
        "Week",
        "Title",
        "Group",
        "Item",
        "Subitem",
        "Person",
        "Start Date",
        "End Date"
    ];


    const rows = tasks.map(task => [

        task.id,
        task.week,
        task.title,
        task.group,
        task.item,
        task.subitem,
        task.person,
        task.startDate,
        task.endDate

    ]);


    const csvContent = [
        headers,
        ...rows
    ]
        .map(row =>
            row
                .map(csvEscape)
                .join(",")
        )
        .join("\n");


    // File System Access API

    if ("showSaveFilePicker" in window) {

        try {

            const fileHandle =
                await window.showSaveFilePicker({

                    suggestedName:
                        "gantt_tasks.csv",

                    types: [
                        {
                            description:
                                "CSV Files",

                            accept: {
                                "text/csv":
                                    [".csv"]
                            }
                        }
                    ]

                });


            const writable =
                await fileHandle.createWritable();


            await writable.write(
                csvContent
            );


            await writable.close();

            alert("CSV saved successfully.");

            return;

        } catch (error) {

            if (error.name === "AbortError") {
                return;
            }

            console.error(error);
        }
    }


    // Fallback

    downloadCSV(
        csvContent,
        "gantt_tasks.csv"
    );
}


// =========================
// BUTTONS
// =========================

const exportCSVBtn =
    document.getElementById("exportCSV");

if (exportCSVBtn) {

    exportCSVBtn.addEventListener(
        "click",
        exportCSV
    );
}


const saveCSVBtn =
    document.getElementById("saveCSV");

if (saveCSVBtn) {

    saveCSVBtn.addEventListener(
        "click",
        saveAsCSV
    );
}


// =========================
// RENDER EVERYTHING
// =========================

function renderAll() {

    renderTaskTable();

    renderGantt();

    if (taskCount) {

        taskCount.textContent =
            `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;
    }
}


// =========================
// START APP
// =========================

renderAll();
