// 알림 권한 요청
if (Notification.permission !== "default") {
  Notification.requestPermission();
}

// 알림 체크 (1분마다)
setInterval(function () {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  for (let i = 0; i < medicines.length; i++) {
    if (medicines[i].alarmOn && !medicines[i].checked && medicines[i].time === currentTime) {
      new Notification("💊 복용 시간이에요!", {
        body: medicines[i].name + " " + medicines[i].dose + " 복용할 시간입니다."
      });
    }
  }
}, 60000);

let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

function save() {
  localStorage.setItem("medicines", JSON.stringify(medicines));
}

function addMedicine() {
  const name = document.getElementById("name").value;
  const dose = document.getElementById("dose").value;
  const time = document.getElementById("time").value;

  if (name === "" || dose === "" || time === "") {
    alert("모든 항목을 입력해주세요!");
    return;
  }

  medicines.push({ name, dose, time, alarmOn: true, checked: false });
  save();
  displayList();

  document.getElementById("name").value = "";
  document.getElementById("dose").value = "";
  document.getElementById("time").value = "";
}

function displayList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  for (let i = 0; i < medicines.length; i++) {
    const item = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = medicines[i].checked;
    checkbox.onchange = function () {
      const now = new Date();
      const [hour, minute] = medicines[i].time.split(":").map(Number);
      const medicineTime = new Date();
      medicineTime.setHours(hour, minute, 0);

      if (now < medicineTime) {
        alert("아직 복용 시간이 되지 않았습니다!");
        checkbox.checked = false;
        return;
      }

      medicines[i].checked = checkbox.checked;
      save();
      displayList();
    };

    const label = document.createElement("span");
    label.textContent = medicines[i].time + " | " + medicines[i].name + " | " + medicines[i].dose;
    if (medicines[i].checked) {
      label.style.textDecoration = "line-through";
      label.style.color = "gray";
    }

    const alarmBtn = document.createElement("button");
    alarmBtn.textContent = medicines[i].alarmOn ? "🔔" : "🔕";
    alarmBtn.onclick = function () {
      medicines[i].alarmOn = !medicines[i].alarmOn;
      save();
      displayList();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";
    deleteBtn.onclick = function () {
      medicines.splice(i, 1);
      save();
      displayList();
    };

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(document.createTextNode("  "));
    item.appendChild(alarmBtn);
    item.appendChild(document.createTextNode("  "));
    item.appendChild(deleteBtn);
    list.appendChild(item);
  }
}

displayList();