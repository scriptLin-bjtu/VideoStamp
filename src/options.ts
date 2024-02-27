const settingdiv = document.getElementById('setting');
const notediv = document.getElementById('note');
const aboutdiv = document.getElementById('about');

document.addEventListener('DOMContentLoaded', () => {
    const title = document.getElementById('title');
    const btnS = document.getElementById('btn-s');
    const btnN = document.getElementById('btn-n');
    const btnA = document.getElementById('btn-a');
    const tip1 = document.getElementById('tip1');
    const tip2 = document.getElementById('tip2');
    const btnC = document.getElementById('btn-color');
    const label1 = document.getElementById('about-author');
    const label2 = document.getElementById('about-version');
    const p1 = document.getElementById('about-explain');
    const a1 = document.getElementById('edge_page');
    const th1 = document.getElementById('th1');
    const th2 = document.getElementById('th2');
    const th3 = document.getElementById('th3');

    let lang: string;

    chrome.storage.local.get(["lang"]).then((result) => {
        console.log(result.lang);
        lang = result.lang;
        if (lang == "chinese") {
            title.textContent = "视频时间戳";
            btnS.textContent = "设置";
            btnN.textContent = "笔记";
            btnA.textContent = "关于";
            tip1.textContent = "设置扩展主题颜色:";
            tip2.textContent = "设置扩展字体颜色:";
            btnC.textContent = "修改";
            label1.textContent = "开发者:LPY";
            label2.textContent = "版本:2.2";
            p1.textContent = "视频时间戳是一个浏览器扩展程序，致力于提升您的浏览器视频观看体验，你可以在多方面使用到:视频网课笔记，电影时刻记录，长视频导航等等......该扩展永久免费使用。如果您对此满意，请给我们一个好评!";
            a1.textContent = "--->去评价";
            th1.textContent = "名称";
            th2.textContent = "视频地址";
            th3.textContent = "视频时刻";

        } else {
            title.textContent = "Video Time Stamp";
            btnS.textContent = "Setting";
            btnN.textContent = "Note";
            btnA.textContent = "About";
            tip1.textContent = "Set your extension theme color:";
            tip2.textContent = "Set your extension text color:";
            btnC.textContent = "Change";
            label1.textContent = "Developer:LPY";
            label2.textContent = "Version:2.2";
            p1.textContent = "The Video Time Stamp is a browser extension program dedicated to optimizing your browser video viewing experience. You can use it in various ways, such as online course notes, movie moments, long video navigation, etc. This extension is permanently free to use. If you are satisfied with it, please give us a good review!";
            a1.textContent = "--->go to review";
            th1.textContent = "name";
            th2.textContent = "url";
            th3.textContent = "video_time";
        }
    });

    document.getElementById('btn-color').addEventListener('click', () => {
        const backgroundcolor = document.getElementById('BackgroundColorInput') as HTMLInputElement;
        const textcolor = document.getElementById('TextColorInput') as HTMLInputElement;

        chrome.storage.local.set({ bkcolor: backgroundcolor.value, tcolor: textcolor.value });
    });

    document.getElementById('btn-s').addEventListener('click', () => {
        settingdiv.style.display = "block";
        notediv.style.display = "none";
        aboutdiv.style.display = "none";
    });

    document.getElementById('btn-n').addEventListener('click', () => {
        let db: IDBDatabase;

        // 打开或创建 IndexedDB 数据库
        const request = indexedDB.open('myDatabase2', 2);
        const table = document.getElementById("table") as HTMLTableElement;
        const tbody = table.getElementsByTagName("tbody")[0];

        settingdiv.style.display = "none";
        notediv.style.display = "block";
        aboutdiv.style.display = "none";
        tbody.innerHTML = "";

        request.onupgradeneeded = (event: any) => {
            // 在数据库升级时创建对象存储
            db = event.target.result;
            const store = db.createObjectStore('myStore', { keyPath: 'id', autoIncrement: true });
            store.createIndex('nameIndex', 'name', { unique: false });
            console.log('yes creat');
        };

        request.onsuccess = (event: any) => {
            // 数据库已成功打开
            db = event.target.result;

            const transaction = db.transaction(['myStore'], 'readonly');
            const store = transaction.objectStore('myStore');
            const cursorRequest = store.openCursor();

            cursorRequest.onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    console.log(cursor.value);
                    // 创建新行
                    const newRow = tbody.insertRow();

                    // 创建单元格并添加文本
                    const name = newRow.insertCell(0);
                    name.appendChild(document.createTextNode(cursor.value.name));

                    const url = newRow.insertCell(1);
                    url.appendChild(document.createTextNode(cursor.value.url));

                    const time = newRow.insertCell(2);
                    time.appendChild(document.createTextNode(cursor.value.videoTime));

                    cursor.continue();
                }
            };
            console.log('suc load');
        };

        request.onerror = (event: any) => {
            // 打开或创建数据库时发生错误
            console.error('ero:', event.target.errorCode);
        };
    });

    document.getElementById('btn-a').addEventListener('click', () => {
        settingdiv.style.display = "none";
        notediv.style.display = "none";
        aboutdiv.style.display = "block";
    });

    document.getElementById('btn-chinese').addEventListener('click', () => {
        title.textContent = "视频时间戳";
        btnS.textContent = "设置";
        btnN.textContent = "笔记";
        btnA.textContent = "关于";
        tip1.textContent = "设置扩展主题颜色:";
        tip2.textContent = "设置扩展字体颜色:";
        btnC.textContent = "修改";
        label1.textContent = "开发者:LPY";
        label2.textContent = "版本:2.2";
        p1.textContent = "视频时间戳是一个浏览器扩展程序，致力于提升您的浏览器视频观看体验，你可以在多方面使用到:视频网课笔记，电影时刻记录，长视频导航等等......该扩展永久免费使用。如果您对此满意，请给我们一个好评!";
        a1.textContent = "--->去评价";
        th1.textContent = "名称";
        th2.textContent = "视频地址";
        th3.textContent = "视频时刻";

        chrome.storage.local.set({ lang: "chinese" });
    });

    document.getElementById('btn-english').addEventListener('click', () => {
        title.textContent = "Video Time Stamp";
        btnS.textContent = "Setting";
        btnN.textContent = "Note";
        btnA.textContent = "About";
        tip1.textContent = "Set your extension theme color:";
        tip2.textContent = "Set your extension text color:";
        btnC.textContent = "Change";
        label1.textContent = "Developer:LPY";
        label2.textContent = "Version:2.2";
        p1.textContent = "The Video Time Stamp is a browser extension program dedicated to optimizing your browser video viewing experience. You can use it in various ways, such as online course notes, movie moments, long video navigation, etc. This extension is permanently free to use. If you are satisfied with it, please give us a good review!";
        a1.textContent = "--->go to review";
        th1.textContent = "name";
        th2.textContent = "url";
        th3.textContent = "video_time";

        chrome.storage.local.set({ lang: "english" });
    });
});
