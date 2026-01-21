document.addEventListener("DOMContentLoaded", () => {

  let db = [];

  // MCC Categories + HSBC Eligible List
  const mccMap = {
    "5811": "Restaurant / Catering",
    "5812": "Restaurant / Dining",
    "5813": "Bar / Pub",
    "5814": "Food Delivery / Fast Food",

    "5411": "Grocery / Supermarket",
    "5422": "Meat / Frozen Food",
    "5441": "Confectionery",
    "5451": "Dairy Store",
    "5462": "Bakery",
    "5499": "Specialty Food",

    "5921": "Liquor Store"
  };

  const eligibleMCC = Object.keys(mccMap);

  // UI Elements
  const tabLookup = document.getElementById("tabLookup");
  const tabCheck = document.getElementById("tabCheck");

  const lookupView = document.getElementById("lookupView");
  const checkView = document.getElementById("checkView");

  const searchBox = document.getElementById("searchBox");
  const searchBtn = document.getElementById("searchBtn");
  const resultBox = document.getElementById("resultBox");

  const storeInput = document.getElementById("storeInput");
  const mccInput = document.getElementById("mccInput");
  const saveBtn = document.getElementById("saveBtn");

  const checkResult = document.getElementById("checkResult");

  // Load stored data
  chrome.storage.sync.get(["mccData"], (res) => {
    if (res.mccData) {
      db = res.mccData;
    }
  });

  // Save to storage
  function saveDB() {
    chrome.storage.sync.set({ mccData: db });
  }

  // Tab Switching
  tabLookup.addEventListener("click", () => {
    lookupView.style.display = "block";
    checkView.style.display = "none";
    tabLookup.classList.add("active");
    tabCheck.classList.remove("active");
  });

  tabCheck.addEventListener("click", () => {
    lookupView.style.display = "none";
    checkView.style.display = "block";
    tabCheck.classList.add("active");
    tabLookup.classList.remove("active");
  });

  // Search Logic
  searchBtn.addEventListener("click", () => {

    const q = searchBox.value.trim().toLowerCase();
    let html = "";

    db.forEach(item => {

      if (
        item.store.toLowerCase().includes(q) ||
        item.mcc === q
      ) {

        html += `
          <div class="resultRow">
            <span>${item.store} : ${item.mcc}</span>
            <button class="selectBtn" data-store="${item.store}" data-mcc="${item.mcc}">
              Select
            </button>
          </div>
        `;
      }

    });

    resultBox.innerHTML = html || "No results found";

    // Attach Select Buttons
    document.querySelectorAll(".selectBtn").forEach(btn => {

      btn.addEventListener("click", () => {

        const store = btn.dataset.store;
        const mcc = btn.dataset.mcc;

        tabCheck.click();

        const category = mccMap[mcc] || "Other / Not Eligible";

        if (eligibleMCC.includes(mcc)) {

          checkResult.innerHTML = `
            <p><b>Merchant:</b> ${store}</p>
            <p><b>MCC:</b> ${mcc}</p>
            <p><b>Category:</b> ${category}</p>
            <p class="yes">10% Cashback: YES</p>
          `;

        } else {

          checkResult.innerHTML = `
            <p><b>Merchant:</b> ${store}</p>
            <p><b>MCC:</b> ${mcc}</p>
            <p><b>Category:</b> ${category}</p>
            <p class="no">10% Cashback: NO</p>
          `;

        }

      });

    });

  });

  // Save / Update Entry
  saveBtn.addEventListener("click", () => {

    const store = storeInput.value.trim();
    const mcc = mccInput.value.trim();

    if (!store || !mcc) {
      alert("Fill both fields");
      return;
    }

    const found = db.find(
      x => x.store.toLowerCase() === store.toLowerCase()
    );

    if (found) {
      found.mcc = mcc;
    } else {
      db.push({ store, mcc });
    }

    saveDB();
    alert("Saved");

  });

});
