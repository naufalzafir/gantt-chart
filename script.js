```javascript
// ==========================================
// DATA
// ==========================================

let tasks = [];

let editingTaskId = null;


// ==========================================
// DOM ELEMENTS
// ==========================================

const taskForm =
    document.getElementById("taskForm");

const weekInput =
    document.getElementById("week");

const titleInput =
    document.getElementById("title");

const groupInput =
    document.getElementById("group");

const itemInput =
    document.getElementById("item");

const subitemInput =
    document.getElementById("subitem");

const personInput =
    document.getElementById("person");

const startDateInput =
    document.getElementById("startDate");

const endDateInput =
    document.getElementById("endDate");

const taskTableBody =
    document.getElementById("taskTableBody");

const taskCount =
    document.getElementById("taskCount");

const submitButton =
    document.getElementById("submitButton");

const cancelEditButton =
    document.getElementById("cancelEditButton");

const ganttContainer =
    document.getElementById("ganttContainer");


// ==========================================
// ADD / EDIT TASK
// ==========================================

taskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const startDate =
            startDateInput.value;

        const endDate =
            endDateInput.value;


        // Only validate if both dates exist

        if (
            startDate &&
            endDate &&
            endDate < startDate
        ) {

            alert(
                "End date cannot be before start date."
            );

            return;
        }


        // ======================================
        // EDIT EXISTING TASK
        // ======================================

        if (editingTaskId !== null) {

            const task =
                tasks.find(
                    task =>
                        task.id === editingTaskId
                );


            if (task) {

                task.week =
                    weekInput.value;

                task.title =
                    titleInput.value;

                task.group =
                    groupInput.value;

                task.item =
                    itemInput.value;

                task.subitem =
                    subitemInput.value;

                task.person =
                    personInput.value;

                task.startDate =
                    startDate;

                task.endDate =
                    endDate;

            }


            editingTaskId = null;


            submitButton.textContent =
                "Add Task";


            cancelEditButton.hidden =
                true;

        }


        // ======================================
        // ADD NEW TASK
        // ======================================

        else {

            const newTask = {

                id: generateID(),

                week:
                    weekInput.value,

                title:
                    titleInput.value,

                group:
                    groupInput.value,

                item:
                    itemInput.value,

                subitem:
                    subitemInput.value,

                person:
                    personInput.value,

                startDate:
                    startDate,

                endDate:
                    endDate

            };


            tasks.push(newTask);

        }


        taskForm.reset();


        renderAll();

    }
);


// ==========================================
// GENERATE ID
// ==========================================

function generateID() {

    return (
        "TASK-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 1000
        )
    );

}


// ==========================================
// EDIT TASK
// ==========================================

function editTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) return;


    weekInput.value =
        task.week || "";


    titleInput.value =
        task.title || "";


    groupInput.value =
        task.group || "";


    itemInput.value =
        task.item || "";


    subitemInput.value =
        task.subitem || "";


    personInput.value =
        task.person || "";


    startDateInput.value =
        task.startDate || "";


    endDateInput.value =
        task.endDate || "";


    editingTaskId =
        id;


    submitButton.textContent =
        "Update Task";


    cancelEditButton.hidden =
        false;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ==========================================
// CANCEL EDIT
// ==========================================

cancelEditButton.addEventListener(
    "click",
    function () {

        editingTaskId =
            null;


        taskForm.reset();


        submitButton.textContent =
            "Add Task";


        cancelEditButton.hidden =
            true;

    }
);


// ==========================================
// DELETE TASK
// ==========================================

function deleteTask(id) {

    const confirmed =
        confirm(
            "Delete this task?"
        );


    if (!confirmed) return;


    tasks =
        tasks.filter(
            task => task.id !== id
        );


    renderAll();

}


// ==========================================
// RENDER EVERYTHING
// ==========================================

function renderAll() {

    renderTaskTable();

    renderGantt();

    updateTaskCount();

}


// ==========================================
// TASK COUNT
// ==========================================

function updateTaskCount() {

    taskCount.textContent =
        `${tasks.length} task${
            tasks.length === 1
                ? ""
                : "s"
        }`;

}


// ==========================================
// TASK TABLE
// ==========================================

function renderTaskTable() {

    taskTableBody.innerHTML = "";


    tasks.forEach(task => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHTML(task.week)}
            </td>

            <td>
                ${escapeHTML(task.title)}
            </td>

            <td>
                ${escapeHTML(task.group)}
            </td>

            <td>
                ${escapeHTML(task.item)}
            </td>

            <td>
                ${escapeHTML(task.subitem)}
            </td>

            <td>
                ${escapeHTML(task.person)}
            </td>

            <td>
                ${task.startDate || "-"}
            </td>

            <td>
                ${task.endDate || "-"}
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit"
                        onclick="editTask('${task.id}')"
                    >
                        Edit
                    </button>


                    <button
                        class="delete"
                        onclick="deleteTask('${task.id}')"
                    >
                        Delete
                    </button>

                </div>

            </td>

        `;


        taskTableBody.appendChild(row);

    });

}


// ==========================================
// GANTT
// ==========================================

function renderGantt() {

    ganttContainer.innerHTML = "";


    if (tasks.length === 0) {

        ganttContainer.innerHTML =
            "<p>No tasks available.</p>";

        return;
    }


    // ======================================
    // ONLY USE TASKS WITH VALID DATES
    // ======================================

    const datedTasks =
        tasks.filter(task =>
            task.startDate &&
            task.endDate
        );


    // ======================================
    // NO DATES
    // ======================================

    if (datedTasks.length === 0) {

        ganttContainer.innerHTML =
            "<p>No dated tasks available for the Gantt chart.</p>";

        return;
    }


    // ======================================
    // FIND EARLIEST / LATEST
    // ======================================

    let earliest =
        new Date(
            datedTasks[0].startDate
        );


    let latest =
        new Date(
            datedTasks[0].endDate
        );


    datedTasks.forEach(task => {

        const start =
            new Date(task.startDate);


        const end =
            new Date(task.endDate);


        if (start < earliest) {

            earliest = start;

        }


        if (end > latest) {

            latest = end;

        }

    });


    // ======================================
    // CREATE DATE ARRAY
    // ======================================

    const dates =
        getDatesBetween(
            earliest,
            latest
        );


    // ======================================
    // MAIN GANTT
    // ======================================

    const gantt =
        document.createElement("div");


    gantt.className =
        "gantt";


    // ======================================
    // HEADER
    // ======================================

    const header =
        document.createElement("div");


    header.className =
        "gantt-header";


    const labelHeader =
        document.createElement("div");


    labelHeader.className =
        "gantt-label-header";


    labelHeader.textContent =
        "Task";


    const timelineHeader =
        document.createElement("div");


    timelineHeader.className =
        "timeline-header";


    dates.forEach(date => {

        const day =
            document.createElement("div");


        day.className =
            "day-header";


        day.textContent =
            `${date.getDate()}/${
                date.getMonth() + 1
            }`;


        timelineHeader.appendChild(day);

    });


    header.appendChild(
        labelHeader
    );


    header.appendChild(
        timelineHeader
    );


    gantt.appendChild(
        header
    );


    // ======================================
    // TASK ROWS
    // ======================================

    datedTasks.forEach(task => {

        const row =
            document.createElement("div");


        row.className =
            "gantt-row";


        // ==================================
        // TASK LABEL
        // ==================================

        const label =
            document.createElement("div");


        label.className =
            "task-label";


        label.innerHTML = `

            <span class="task-week">

                ${escapeHTML(task.week)}

            </span>


            <span class="task-title">

                ${escapeHTML(
                    task.item ||
                    task.title ||
                    "Untitled Task"
                )}

            </span>


            <span class="task-info">

                ${escapeHTML(
                    task.subitem
                )}

                ${task.subitem ? " • " : ""}

                ${escapeHTML(
                    task.person
                )}

            </span>

        `;


        // ==================================
        // TIMELINE
        // ==================================

        const timeline =
            document.createElement("div");


        timeline.className =
            "timeline";


        // ==================================
        // GRID
        // ==================================

        dates.forEach(() => {

            const day =
                document.createElement("div");


            day.className =
                "timeline-day";


            timeline.appendChild(day);

        });


        // ==================================
        // TASK BAR
        // ==================================

        const bar =
            document.createElement("div");


        bar.className =
            "task-bar";


        bar.textContent =
            task.item ||
            task.title ||
            "Task";


        const start =
            new Date(
                task.startDate
            );


        const end =
            new Date(
                task.endDate
            );


        const startIndex =
            daysBetween(
                earliest,
                start
            );


        const duration =
            daysBetween(
                start,
                end
            ) + 1;


        const dayWidth =
            50;


        bar.style.left =
            `${startIndex * dayWidth}px`;


        bar.style.width =
            `${Math.max(
                duration * dayWidth - 8,
                20
            )}px`;


        timeline.appendChild(
            bar
        );


        row.appendChild(
            label
        );


        row.appendChild(
            timeline
        );


        gantt.appendChild(
            row
        );

    });


    // ======================================
    // ADD GANTT TO PAGE
    // ======================================

    ganttContainer.appendChild(
        gantt
    );

}


// ==========================================
// DATE UTILITIES
// ==========================================

function getDatesBetween(
    start,
    end
) {

    const dates = [];


    const current =
        new Date(start);


    while (current <= end) {

        dates.push(
            new Date(current)
        );


        current.setDate(
            current.getDate() + 1
        );

    }


    return dates;

}


function daysBetween(
    start,
    end
) {

    const milliseconds =
        1000 *
        60 *
        60 *
        24;


    return Math.round(
        (
            end - start
        ) /
        milliseconds
    );

}


// ==========================================
// HTML SAFETY
// ==========================================

function escapeHTML(value) {

    return String(value || "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==========================================
// CSV EXPORT
// ==========================================

function exportCSV() {

    if (tasks.length === 0) {

        alert(
            "There are no tasks to export."
        );

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


    const rows =
        tasks.map(task => [

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


    const csv =
        createCSV(
            headers,
            rows
        );


    downloadCSV(
        csv,
        "gantt_tasks.csv"
    );

}


// ==========================================
// SAVE AS CSV
// ==========================================

async function saveAsCSV() {

    if (tasks.length === 0) {

        alert(
            "There are no tasks to save."
        );

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


    const rows =
        tasks.map(task => [

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


    const csv =
        createCSV(
            headers,
            rows
        );


    // ======================================
    // FILE SYSTEM ACCESS API
    // ======================================

    if (
        "showSaveFilePicker"
        in window
    ) {

        try {

            const handle =
                await window.showSaveFilePicker({

                    suggestedName:
                        "gantt_tasks.csv",

                    types: [

                        {
                            description:
                                "CSV File",

                            accept: {

                                "text/csv":
                                    [".csv"]

                            }

                        }

                    ]

                });


            const writable =
                await handle.createWritable();


            await writable.write(
                csv
            );


            await writable.close();


            alert(
                "CSV saved successfully."
            );

        }


        catch (error) {

            if (
                error.name !==
                "AbortError"
            ) {

                console.error(
                    error
                );


                alert(
                    "Unable to save the file."
                );

            }

        }

    }


    // ======================================
    // FALLBACK
    // ======================================

    else {

        downloadCSV(
            csv,
            "gantt_tasks.csv"
        );

    }

}


// ==========================================
// CREATE CSV
// ==========================================

function createCSV(
    headers,
    rows
) {

    const allRows = [

        headers,

        ...rows

    ];


    return allRows
        .map(row => {

            return row
                .map(value => {

                    return csvEscape(
                        value
                    );

                })
                .join(",");

        })
        .join("\n");

}


// ==========================================
// CSV ESCAPE
// ==========================================

function csvEscape(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const stringValue =
        String(value);


    if (

        stringValue.includes(",") ||

        stringValue.includes('"') ||

        stringValue.includes("\n")

    ) {

        return '"' +

            stringValue.replaceAll(
                '"',
                '""'
            ) +

            '"';

    }


    return stringValue;

}


// ==========================================
// DOWNLOAD CSV
// ==========================================

function downloadCSV(
    csv,
    filename
) {

    const blob =
        new Blob(

            [
                "\ufeff" +
                csv
            ],

            {
                type:
                    "text/csv;charset=utf-8;"
            }

        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// ==========================================
// INITIAL RENDER
// ==========================================

renderAll();
```
