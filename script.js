function loadSubjects(branch, semester) {
    let table = document.getElementById("subjectsTable");
    table.classList.remove("hidden");
    table.innerHTML = `
        <tr>
            <th>Subject Name</th>
            <th>Subject Code</th>
            <th>Credits</th>
            <th>Marks</th>
        </tr>
    `;
    document.getElementById("selectedSemester").textContent = `Semester: ${semester}`;

    let filteredSubjects = subjectsData.SubjectsData.filter(sub => sub.Branch === branch && sub.Semester === semester);
    filteredSubjects.forEach(sub => {
        let row = table.insertRow(-1);
        row.innerHTML = `
            <td>${sub.SubjectName}</td>
            <td>${sub.SubjectCode}</td>
            <td>${sub.Credits}</td>
            <td><input type="number" min="0" max="100" class="marksInput"></td>
        `;
    });

    document.getElementById("calculateBtn").classList.remove("hidden");
    document.getElementById("resetSGPA").classList.remove("hidden");
    table.scrollIntoView({ behavior: "smooth", block: "start" });

}

function loadSemesters(branch) {
    let semesterContainer = document.getElementById("semesterButtons");
    semesterContainer.innerHTML = ""; 
    semesterContainer.classList.remove("hidden");

    let semesters = [...new Set(subjectsData.SubjectsData.filter(sub => sub.Branch === branch).map(sub => sub.Semester))];
    document.getElementById("selectedBranch").textContent = `Branch: ${branch}`;
    semesters.forEach(sem => {
        let button = document.createElement("button");
        button.className = "semester-buttons";
        button.textContent = `${sem}`;
        button.onclick = () => loadSubjects(branch, sem);
        semesterContainer.appendChild(button);
    });
    semesterContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}



function showSection(sectionId) {
    document.querySelectorAll("section").forEach(section => section.classList.add("hidden"));
    document.getElementById(sectionId).classList.remove("hidden");

    history.pushState({ section: sectionId }, "", `#${sectionId}`);
}




function selectType(type) {
    if (type === 'SGPA') {
        showSection("sgpacalculator");
    } else if (type === 'CGPA') {
        showCGPAPage();
    }
}

function showCGPAPage() {
    generateCGPAFields();
    showSection("cgpacalculator");  
}

function generateCGPAFields() {
    const container = document.getElementById("cgpa-fields");
    container.innerHTML = "";

    for (let i = 1; i <= 8; i++) {
        const field = document.createElement("div");
        field.classList.add("cgpa-field");
        
        const label = document.createElement("label");
        label.setAttribute("for", `sgpa${i}`);
        label.textContent = `SGPA for Semester ${i}:`;

        const input = document.createElement("input");
        input.type = "number";
        input.id = `sgpa${i}`;
        input.step = "0.01";
        input.min = "0";
        input.max = "10";
        input.placeholder = "Enter SGPA";
        input.classList.add("sgpa-input");

        field.append(label, input);
        container.appendChild(field);
    }
}

function calculateCGPA() {
    let totalSGPA = 0;
    let count = 0;

    for (let i = 1; i <= 8; i++) {
        let sgpaValue = document.getElementById(`sgpa${i}`).value.trim();

        if (sgpaValue !== "") {  
            let sgpa = parseFloat(sgpaValue);             
            if (sgpa < 0 || sgpa > 10) {
                alert("⚠️ SGPA must be between 0 and 10.");
                document.getElementById("cgpa-result").innerHTML = '<b style="font-size: 18px; color: red;">⚠️ SGPA must be between 0 and 10.</b>';
                return;
            }
            totalSGPA += sgpa;
            count++;
        }
    }

    if (count === 0) {
        alert("⚠️ Please enter at least one SGPA to calculate CGPA.");
        document.getElementById("cgpa-result").innerText = '<b style="font-size: 18px; color: red;">⚠️ Please enter at least one SGPA to calculate CGPA.</b>';
        return;
    }

    let cgpa = totalSGPA / count;
    document.getElementById("cgpa-result").innerText = `🎉 Your CGPA is: ${cgpa.toFixed(2)} 🎓`;
}

function resetCGPA() {
    for (let i = 1; i <= 8; i++) {
        document.getElementById(`sgpa${i}`).value = ""; 
    }
    document.getElementById("cgpa-result").innerText = ""; 
}

function goBackToHomeFromSGPA() {
    showSection("home");
    resetSGPA()
    
}
function goBackToHomeFromCGPA() {
    showSection("home");
    resetCGPA()
    
}


function getGradePoints(marks) {
    if (marks >= 90) return 10;
    else if (marks >= 80) return 9;
    else if (marks >= 70) return 8;
    else if (marks >= 60) return 7;
    else if (marks >= 55) return 6;
    else if (marks >= 50) return 5;
    else if (marks >= 40) return 4;
    return 0;
}

function getGrade(marks) {
    if (marks >= 90) return "O";
    else if (marks >= 80) return "A+";
    else if (marks >= 70) return "A";
    else if (marks >= 60) return "B+";
    else if (marks >= 55) return "B";
    else if (marks >= 50) return "C";
    else if (marks >= 40) return "P";
    return "F";
}

let subjectsData = { "SubjectsData": [] }; 

async function loadJSON() {
    try {
        let response = await fetch("subjects.json");
        subjectsData = await response.json();
        if (!subjectsData || !subjectsData.SubjectsData) {
            throw new Error("Invalid JSON structure");
        }
        loadBranches();
    } catch (error) {
        console.error("Error loading JSON:", error);
    }
}

function loadBranches() {
    let branches = [...new Set(subjectsData.SubjectsData.map(sub => sub.Branch))];
    let branchContainer = document.getElementById("branchButtons");
    branchContainer.innerHTML = "";
    
    branches.forEach(branch => {
        let button = document.createElement("button");
        button.className = "semester-buttons";
        button.textContent = branch;
        button.onclick = () => loadSemesters(branch);
        branchContainer.appendChild(button);
    });

}




function calculateSGPA() {
    let table = document.getElementById("subjectsTable");
    let rows = table.getElementsByTagName("tr");
    let totalCredits = 0;
    let weightedGradePoints = 0;

    let calculationTable = document.getElementById("sgpaCalculationTable");
    calculationTable.innerHTML = `  
        <tr>
            <th>Subject Name</th>
            <th>Marks</th>
            <th>Grade</th>
            <th>Grade Points</th>
            <th>Credits</th>
            <th>Weighted Grade Points</th>
        </tr>
    `;

    for (let i = 1; i < rows.length; i++) {
        let marks = rows[i].getElementsByClassName("marksInput")[0].value.trim();
        if (marks === "" || isNaN(marks) || marks < 0 || marks > 100) {
            alert("⚠️ Please enter valid marks for all subjects (0-100).");
            document.getElementById("result").innerHTML = '<b style="font-size: 18px; color: red;">⚠️ Please enter valid marks for all subjects.</b>';
            return;
        }

        let marksInt = parseInt(marks);
        let credits = parseFloat(rows[i].cells[2].innerText);
        let gradePoint = getGradePoints(marksInt);
        let weightedGP = gradePoint * credits;
        
        totalCredits += credits;
        weightedGradePoints += weightedGP;

        let calcRow = calculationTable.insertRow(-1);
        calcRow.innerHTML = `
            <td>${rows[i].cells[0].innerText}</td>
            <td>${marksInt}</td>
            <td>${getGrade(marksInt)}</td>
            <td>${gradePoint}</td>
            <td>${credits}</td>
            <td>${weightedGP.toFixed(2)}</td>
        `;
    }

    let sgpa = (weightedGradePoints / totalCredits).toFixed(2);

    let totalRow = calculationTable.insertRow(-1);
    totalRow.classList.add("total-row");

    totalRow.innerHTML = `
        <td colspan="4" class="total-label">Total:</td>
        <td><b>${totalCredits}</b></td>
        <td><b>${weightedGradePoints.toFixed(2)}</b></td>
    `;
    let formulaRow = calculationTable.insertRow(-1);
    formulaRow.classList.add("total-row");
    formulaRow.innerHTML = `
        <td colspan="6" class="formula">
            SGPA = <b>
            <span class="fraction">
                <span class="numerator">${weightedGradePoints.toFixed(2)}</span>
                <span class="denominator">${totalCredits}</span>
            </span> = ${sgpa}
            </b>
        </td>
    `;
    document.getElementById("result").innerHTML = `🎉 Your SGPA is: <b>${sgpa}</b> 🎓`;

    calculationTable.classList.remove("hidden");  
}




window.onload = async function () {
    await loadJSON();
};


function resetSGPA() {
    const table = document.getElementById("subjectsTable");
    const inputs = table.getElementsByTagName("input");

    for (let input of inputs) {
        input.value = "";
    }

    document.getElementById("result").innerText = "";
    
    document.getElementById("sgpaCalculationTable").classList.add("hidden");  
    document.getElementById("toggleTableBtn").classList.add("hidden"); 
}

