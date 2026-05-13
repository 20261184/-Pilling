let medicines = [];

function addMedicine() {
  const name = document.getElementById("name").value;
  const dose = document.getElementById("dose").value;
  const time = document.getElementById("time").value;

  // 빈 값 체크
  if (name === "" || dose === "" || time === "") {
    alert("모든 항목을 입력해주세요!");
    return;
  }

  const medicine = {
    name: name,
    dose: dose,
    time: time,
    alarmOn: true,
    checked: false
  };

  medicines.push(medicine);
  console.log(medicines);
  displayList();

  // 입력창 초기화
  document.getElementById("name").value = "";
  document.getElementById("dose").value = "";
  document.getElementById("time").value = "";
}

function displayList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  for (let i = 0; i < medicines.length; i++) {
    const item = document.createElement("li");
    item.textContent = medicines[i].time + " | " + medicines[i].name + " | " + medicines[i].dose;
    list.appendChild(item);
  }
}