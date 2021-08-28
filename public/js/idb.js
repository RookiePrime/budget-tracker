// Create the global variable that will contain the db connection
let db;

// Create the global variable connecting to IndexedDB
const request = indexedDB.open('budget_tracker', 1);

// Event emission if the database version changes
request.onupgradeneeded = e => {
    // Save a ref to the db
    const db = e.target.result;
    // Create an object store, with auto-incrementing primary key
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = e => {
    // Save ref to object store in global variable
    db = e.target.result;

    // If app's online, run sendTransaction()
    if (navigator.onLine) {
        console.log('App is online')
        uploadTransaction();
    };
};

// Error logging
request.onerror = e => console.log(e.target.errorCode);

// Save the data to the idb if no internet connectoin is found
const saveRecord = record => {
    // Open new transaction with idb
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // access the object store
    const moneyObjectStore = transaction.objectStore('new_transaction');
    // Add record to store
    moneyObjectStore.add(record);

};

// Upload transaction to db when connection established
const uploadTransaction = () => {
    // Open transaction with db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // Access object store
    const moneyObjectStore = transaction.objectStore('new_transaction');
    // Get all records from store
    const getAll = moneyObjectStore.getAll();
    // .getAll() is async, so the rest is contingent on assuming its success:
    getAll.onsuccess = () => {
        // If there was data, send it out
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // Assuming no error, let's clear the idb
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const moneyObjectStore = transaction.objectStore('new_transaction');
                    moneyObjectStore.clear();

                    alert('All saved transactions have been submitted!');
                    window.location.reload();
                })
                .catch(err => console.log(err));
        }
    };
};

// Add browser event listener so that the page is always checking for the internets
window.addEventListener('online', uploadTransaction);