let db;
let data = [];
// 打开 IndexedDB 数据库
let request = indexedDB.open('myDatabase2', 2);

request.onupgradeneeded = function (event) {
    // 数据库升级时创建对象存储空间
    db = event.target.result;
    let store = db.createObjectStore('myStore', { keyPath: 'id', autoIncrement: true });
    store.createIndex('nameIndex', 'name', { unique: false });
    console.log('yes creat');
};

request.onsuccess = function (event) {
    // 数据库打开成功后的处理
    db = event.target.result;

    let transaction = db.transaction(['myStore'], 'readonly');
    let store = transaction.objectStore('myStore');
    let cursorRequest = store.openCursor();

    cursorRequest.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            console.log(cursor.value);
            data.push(cursor.value);
            cursor.continue();
        }
    };
    console.log('suc load');
};

request.onerror = function (event) {
    // 打开数据库时发生错误的处理
    console.error('ero:', event.target.errorCode);
};

// 监听来自 popup 页面的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.getDataFromIndexedDB) {

        sendResponse({ dataFromIndexedDB: data });

    }
    if (request.dataToBackground) {
                // 存储数据到数据库
        let transaction = db.transaction(['myStore'], 'readwrite');
        let store = transaction.objectStore('myStore');

        store.add({
            name: request.dataToBackground.name,
            url: request.dataToBackground.url,
            videoTime: request.dataToBackground.videoTime
        });
        data.push({
            name: request.dataToBackground.name,
            url: request.dataToBackground.url,
            videoTime: request.dataToBackground.videoTime
        });
        transaction.oncomplete = function () {
            console.log('store ok');
            sendResponse({ success: true });
        };
    }
    if (request.deleteValueFromIndexedDB) {

        let transaction = db.transaction(['myStore'], 'readwrite');
        let store = transaction.objectStore('myStore');

        let valueToDelete = request.deleteValueFromIndexedDB;

        
        let deleteRequest;
        
        let cursorRequest = store.openCursor();

        cursorRequest.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
               let record = cursor.value;
                if (record.name === valueToDelete) {
                    
                    deleteRequest = store.delete(cursor.primaryKey);
                    data.pop(record);
                    deleteRequest.onsuccess = function () {
                        console.log('delete ok');
                        sendResponse({ success: true });
                    };
                }
                cursor.continue(); 
            }
        };

    }

});
// 通过监听 webNavigation.onCompleted 事件实现在视频网站跳转时执行脚本
chrome.webNavigation.onCompleted.addListener(function (details) {
    console.log("complete1");

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        chrome.storage.local.get(["time", "url"]).then((result) => {
            let currentTab = tabs[0];
            if (result.url === currentTab.url) {
                console.log("complete2");
                setTimeout(function () {
                    console.log("complete3");
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: function (arg1) {
                            let videoElement = document.querySelector('video');
                            if (videoElement) {
                                videoElement.currentTime = arg1;
                            }
                        },
                        args: [result.time]
                    });
                }, 1000);
            }

        });


    });

});