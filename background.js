let db;
let data = [];
// �򿪻򴴽� IndexedDB ���ݿ�
let request = indexedDB.open('myDatabase2', 2);

request.onupgradeneeded = function (event) {
    // �����ݿ�����ʱ���������洢
    db = event.target.result;
    let store = db.createObjectStore('myStore', { keyPath: 'id', autoIncrement: true });
    store.createIndex('nameIndex', 'name', { unique: false });
    console.log('yes creat');
};

request.onsuccess = function (event) {
    // ���ݿ��ѳɹ�����
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
    // �򿪻򴴽����ݿ�ʱ��������
    console.error('ero:', event.target.errorCode);
};

// ��������popup����Ϣ
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.getDataFromIndexedDB) {

        sendResponse({ dataFromIndexedDB: data });

    }
    if (request.dataToBackground) {
        // �洢���ݵ����ݿ�
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

        // ʹ�����������������洢������ƥ���ļ�¼
        let deleteRequest;
        // ʹ���α����������洢�Բ���ƥ���ļ�¼
        let cursorRequest = store.openCursor();

        cursorRequest.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
               let record = cursor.value;
                if (record.name === valueToDelete) {
                    // �ҵ�ƥ���ļ�¼��ִ��ɾ������
                    deleteRequest = store.delete(cursor.primaryKey);
                    data.pop(record);
                    deleteRequest.onsuccess = function () {
                        console.log('delete ok');
                        sendResponse({ success: true });
                    };
                }
                cursor.continue(); // ����������һ����¼
            }
        };

    }

});
//��Ƶ��վ��ת���ɺ�ִ����Ƶʱ�䴦��
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