let isUpdate = true;
let employeePayrollObj = {};
class EmployeePayrollData {
    id;
    get name() { return this._name; }
    set name(name) {
        this._name = name;
    }
    get profilePic(){ return this._profilePic; }
    set profilePic(profilePic){
        this._profilePic = profilePic;
    }
    get gender(){ return this._gender; }
    set gender(gender){
        this._gender = gender;
    }

    get department(){ return this._department; }
    set department(department){
        this._department = department;
    }
    
    get salary() { return this._salary}
    set salary(salary) {
        this._salary = salary
    }
    get note(){ return this._note;}
    set note(note){
        this._note = note;
    }
    get startDate() { return this._startDate}
    set startDate(startDate){
        this._startDate = startDate;
    }
    
    toString() {
        const options = {year : 'numeric', month : 'long', day : 'numeric'};
        const empDate =  this.startDate === undefined ? "undefined" : (new Date(this.startDate)).toLocaleDateString('en-US', options);
        return "id = " + this.id + ", name = " + this.name + ", gender = " + this.gender + 
                ", salary = " + this.salary + ", ProfilePic = " + this.profilePic + ", department = " + this.department + 
                ", start date = " + empDate + ", Notes = " + this.note;
    }
}
window.addEventListener('DOMContentLoaded', () => {
    // Event listener for salary
    const salary = document.querySelector('#salary');
    const output = document.querySelector('.salary-output');
    output.textContent = salary.value;
    salary.addEventListener('input', function(){
        output.textContent = salary.value;
    });
    
    
    //Event listener for name
    const name = document.querySelector('#name');
    const textError = document.querySelector('.text-error');
    name.addEventListener('input', function(){
        if(name.value.length == 0){
            textError.textContent = "";
            return;
        }
        try{
            // (new EmployeePayrollData()).name = name.value;
            checkName(name.value);
            textError.textContent = "";
        }catch(e){
            textError.textContent = e;
        }
    });

    //Event listener for date
    const date = document.querySelector('#date');
    const dateError = document.querySelector('.date-error');
    date.addEventListener('input', function() {
        const startDate = new Date(Date.parse(getInputValueById('#day') + " " + getInputValueById('#month')+" "+getInputValueById('#year')));
        try{
            // (new EmployeePayrollData()).startDate = startDate;
            checkStartDate(new Date(startDate))
            dateError.textContent = "";
        }catch(e){
            dateError.textContent = e;
        }
    });
    checkForUpdate();
});
const save = (event) => {
    event.preventDefault();
    event.stopPropagation();
    try{
        setEmployeePayrollObject();
        if(site_properties.use_local_storage.match("true")){
            createAndUpdateStorage();
            resetForm();
            window.location.replace(site_properties.home_page);
        } else {
            createOrUpdateEmployeePayroll();
        }
    }catch(e){
        return;
    }
} 
const setEmployeePayrollObject = () =>{
    if(!isUpdate  && site_properties.use_local_storage.match("true")){
        employeePayrollObj.id = createNewEmployeeId();
    }
    employeePayrollObj._name = getInputValueById('#name');
    employeePayrollObj._profilePic = getSelectedValues('[name = profile]').pop();
    employeePayrollObj._gender = getSelectedValues('[name = gender]').pop();
    employeePayrollObj._department = getSelectedValues('[name = department]');
    employeePayrollObj._salary = getInputValueById('#salary');
    employeePayrollObj._note = getInputValueById('#notes');
    let date = getInputValueById('#day') + " " + getInputValueById('#month') + " " +
                getInputValueById('#year');
    employeePayrollObj._startDate = Date.parse(date);
}

const createOrUpdateEmployeePayroll = () => {

    let postURL = site_properties.server_url;
    // let postURL = site_properties.spring_url;
    let methodCall = "POST";
    //Update method : UC7
    if(isUpdate){
        methodCall = "PUT";
        postURL = postURL + employeePayrollObj.id.toString();
    }
    //Add method: UC5
    makeServiceCall(methodCall, postURL, true, employeePayrollObj)
        .then(responseText => {
            resetForm();
            window.location.replace(site_properties.home_page);
        })
        .catch(error => {
            throw error;
        })
}

//Saving the data to local storage
function createAndUpdateStorage(){
    let employeePayrollList = JSON.parse(localStorage.getItem("EmployeePayrollList"));
    console.log(employeePayrollList)
    // if(employeePayrollList == null || employeePayrollList == undefined || employeePayrollList.length == undefined){
    //     employeePayrollList = [] ;
        
    // }
    if(employeePayrollList){
        // let employeePayrollData = null;
        // if(employeePayrollList.length > 0){
            let employeePayrollData = employeePayrollList.find(empData => empData.id == employeePayrollObj.id);
        // }
        if(!employeePayrollData){
            employeePayrollList.push(employeePayrollObj);
        }else{
            const index = employeePayrollList.map(empData => empData.id).indexOf(employeePayrollData.id);
            employeePayrollList.splice(index, 1, employeePayrollObj);
        } 
    }else{
        employeePayrollList = [employeePayrollObj];
    }
    localStorage.setItem("EmployeePayrollList", JSON.stringify(employeePayrollList));
    
}
const createNewEmployeeId = () =>{
    let empId = localStorage.getItem("EmployeeID");
    empId = !empId ? 1 : (parseInt(empId)+1).toString();
    localStorage.setItem("EmployeeID",empId);
    return empId;
}
//Populating the employee payroll object
const createEmployeePayrollData = () => {
    let employeePayrollData = new EmployeePayrollData();
    try{
        employeePayrollData.name = getInputValueById('#name');
    }
    catch(e){
        setTextValue('.text-error', e);
        throw e
    }
    employeePayrollData.profilePic = getSelectedValues('[name=profile]').pop();
    employeePayrollData.gender = getSelectedValues('[name = gender]').pop();
    employeePayrollData.department = getSelectedValues('[name = department]');
    employeePayrollData.salary = getInputValueById('#salary');
    let date = getInputValueById('#day') + " " + getInputValueById('#month') + " " +
               getInputValueById('#year');
    employeePayrollData.startDate = Date.parse(date);
    employeePayrollData.note = getInputValueById('#notes');
    alert(employeePayrollData.toString());
    return employeePayrollData;
}
const getSelectedValues = (propertyValue) => {
    let allItems = document.querySelectorAll(propertyValue);
    let setItems = [];
    allItems.forEach(item => {
        if(item.checked){
            setItems.push(item.value);
        }
    });
    return setItems;
}
const getInputValueById = (id) => {
    let value = document.querySelector(id).value;
    return value;
}
// Resetting the form on clicking reset button
const resetForm = () => {
    setValue('#name','');
    unsetSelectedValues('[name = gender');
    unsetSelectedValues('[name = department');
    unsetSelectedValues('[name = profile');
    setValue('#salary', ' ');
    setSelectedValues('#day', '1');
    setSelectedValues('#month', 'January');
    setSelectedValues('#year', '2020');
    setValue('#notes', '');
}

const unsetSelectedValues = (propertyValue) => {
    let allItems = document.querySelectorAll(propertyValue);
    allItems.forEach(item => {
        item.checked = false;
    });    
}

const setValue = (id, value)=>{
    const element = document.querySelector(id);
    element.value = value;
}

const setTextValue = (id, value)=>{
    const element = document.querySelector(id);
    element.textContent = value;
}

const checkForUpdate = () =>{
    const employeePayrollJson = localStorage.getItem('editEmp');
    isUpdate = employeePayrollJson ? true : false;
    if(!isUpdate) return;
    employeePayrollObj = JSON.parse(employeePayrollJson);
    setForm();
}

const setForm = () =>{
    setValue('#name', employeePayrollObj._name);
    setSelectedValues('[name=profile]',employeePayrollObj._profilePic);
    setSelectedValues('[name=gender]',employeePayrollObj._gender);
    setSelectedValues('[name=department]',employeePayrollObj._department);
    setValue('#salary', employeePayrollObj._salary);
    setTextValue('.salary-output', employeePayrollObj._salary);
    setValue('#notes', employeePayrollObj._note);
    let date = stringifyDate(new Date(employeePayrollObj._startDate)).split(" ");
    console.log("String date is: "+date);
    setValue('#day', date[0]);
    setValue('#month', date[1]);
    setValue('#year', date[2]);
}

const setSelectedValues = (propertyValue, value)=>{
    let allItems = document.querySelectorAll(propertyValue);
    allItems.forEach(item =>{
        if(Array.isArray(value)){
            if(value.includes(item.value)){
                item.checked = true;
            }
        }else if(item.value == value){
            item.checked = true;
        }
    });
}